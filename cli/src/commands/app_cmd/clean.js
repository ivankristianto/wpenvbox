import ora from 'ora';
import path from 'path';
import { upOne } from 'docker-compose';
import { readConfig } from '@wordpress/env/lib/config';
import { configureWordPress, resetDatabase } from '@wordpress/env/lib/wordpress';
import WordPress from '../../classes/wordpress';

exports.command = 'clean';
exports.desc = 'Clean wp-env box services';
exports.builder = {
	debug: {
		default: false,
		describe: 'Show debug process',
		type: 'boolean',
	},
	environment: {
		default: 'all',
		describe: 'Environment to clean',
		type: 'string',
	},
};
exports.handler = async function (argv) {
	const { debug, environment } = argv;
	const spinner = ora().start();
	const configPath = path.resolve('.wp-env.json');

	const config = await readConfig(configPath);
	config.debug = debug;
	config.port = process.env.WPENVPORT;

	config.basename = config.workDirectoryPath.split('/').pop();
	config.host = `${config.basename}.${process.env.DOMAIN}`;

	const description = `${environment} environment${environment === 'all' ? 's' : ''}`;
	spinner.text = `Cleaning ${description}.`;

	const tasks = [];

	// Start the database first to avoid race conditions where all tasks create
	// different docker networks with the same name.
	await upOne('mysql', {
		config: config.dockerComposeConfigPath,
		log: config.debug,
	});

	if (environment === 'all' || environment === 'development') {
		tasks.push(
			resetDatabase('development', config)
				.then(() => configureWordPress('development', config))
				.catch(() => {}),
		);
	}

	await Promise.all(tasks);

	await WordPress.updateSiteUrl(config);

	spinner.succeed(`Cleaned ${description}.`);
};
