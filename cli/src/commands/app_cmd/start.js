import ora from 'ora';
import util from 'util';
import fs from 'fs-extra';
import path from 'path';
import { upOne, upAll } from 'docker-compose';
import { readConfig } from '@wordpress/env/lib/config';
import retry from '@wordpress/env/lib/retry';
import downloadSource from '@wordpress/env/lib/download-source';
import {
	checkDatabaseConnection,
	makeContentDirectoriesWritable,
	copyCoreFiles,
	configureWordPress,
} from '@wordpress/env/lib/wordpress';
import WordPress from '../../classes/wordpress';

/**
 * Promisified dependencies
 */
const sleep = util.promisify(setTimeout);
// const rimraf = util.promisify(require('rimraf'));

exports.command = 'start';
exports.desc = 'Start wp-env box services';
exports.builder = {
	debug: {
		default: true,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = async function (argv) {
	const { debug } = argv;
	const spinner = ora().start();
	const configPath = path.resolve('.wp-env.json');

	const config = await readConfig(configPath);
	config.debug = debug;
	config.port = process.env.WPENVPORT;

	config.basename = config.workDirectoryPath.split('/').pop();
	config.host = `${config.basename}.${process.env.DOMAIN}`;

	const progresses = {};
	const getProgressSetter = (id) => (progress) => {
		progresses[id] = progress;
		spinner.text = `Downloading WordPress.\n${Object.entries(progresses)
			.map(([key, value]) => `  - ${key}: ${(value * 100).toFixed(0)}/100%`)
			.join('\n')}`;
	};

	await Promise.all([
		// Preemptively start the database while we wait for sources to download.
		upOne('mysql', {
			config: config.dockerComposeConfigPath,
			log: config.debug,
		}),

		(async () => {
			if (config.coreSource) {
				await downloadSource(config.coreSource, {
					onProgress: getProgressSetter('core'),
					spinner,
					debug: config.debug,
				});
				await copyCoreFiles(config.coreSource.path, config.coreSource.testsPath);

				// Ensure the tests uploads folder is writeable for travis,
				// creating the folder if necessary.
				const testsUploadsPath = path.join(
					config.coreSource.testsPath,
					'wp-content/uploads',
				);
				await fs.mkdir(testsUploadsPath, { recursive: true });
				await fs.chmod(testsUploadsPath, 0o0767);
			}
		})(),

		...config.pluginSources.map((source) =>
			downloadSource(source, {
				onProgress: getProgressSetter(source.basename),
				spinner,
				debug: config.debug,
			}),
		),

		...config.themeSources.map((source) =>
			downloadSource(source, {
				onProgress: getProgressSetter(source.basename),
				spinner,
				debug: config.debug,
			}),
		),
	]);

	spinner.text = 'Starting WordPress.';

	await upAll({
		config: config.dockerComposeConfigPath,
		log: config.debug,
	});

	if (config.coreSource === null) {
		// Don't chown wp-content when it exists on the user's local filesystem.
		await Promise.all([makeContentDirectoriesWritable('development', config)]);
	}

	try {
		await checkDatabaseConnection(config);
	} catch (error) {
		// Wait 30 seconds for MySQL to accept connections.
		await retry(() => checkDatabaseConnection(config), {
			times: 30,
			delay: 1000,
		});

		// It takes 3-4 seconds for MySQL to be ready after it starts accepting connections.
		await sleep(4000);
	}

	// Retry WordPress installation in case MySQL *still* wasn't ready.
	await Promise.all([
		retry(() => configureWordPress('development', config), {
			times: 2,
		}),
	]);

	spinner.text = 'Updating WordPress siteurl...';

	await WordPress.updateSiteUrl(config);

	spinner.succeed(`WordPress started.`);
};
