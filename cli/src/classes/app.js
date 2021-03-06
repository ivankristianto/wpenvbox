// External libs.
import util from 'util';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { generate } from 'generate-password';
import { upOne, upMany, down, rm, run } from 'docker-compose';
import yaml from 'js-yaml';

// Imports from @wordpress/env.
import { readConfig } from '@wordpress/env/lib/config';
import retry from '@wordpress/env/lib/retry';
import downloadSource from '@wordpress/env/lib/download-source';
import {
	checkDatabaseConnection,
	makeContentDirectoriesWritable,
	copyCoreFiles,
	configureWordPress,
	resetDatabase,
} from '@wordpress/env/lib/wordpress';
import buildDockerComposeConfig from '@wordpress/env/lib/build-docker-compose-config';

// Internal lib.
import CodeServer from './code-server';
import Config from './config';
import formatter from '../utils/formatter';
import WordPress from './wordpress';

/**
 * Promisified dependencies
 */
const sleep = util.promisify(setTimeout);
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);

class App {
	/**
	 * Create docker-compose.yml file
	 *
	 * @param {object}  options Options object
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @param {boolean} options.disableCodeserver  True if code server is disabled.
	 * @param {boolean} options.disableTest  True if tests environment is disabled.
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<object>}
	 */
	static async create({ debug, disableCodeserver, disableTest, spinner }) {
		const config = await App.parseConfig({ spinner, debug });

		spinner.text = `Creating ${config.workDirectoryPath} directory.`;
		await fs.mkdir(config.workDirectoryPath, { recursive: true });

		const dockerComposeConfig = buildDockerComposeConfig(config);

		// Add networks: proxy
		dockerComposeConfig.networks = { proxy: { external: { name: 'proxy' } } };

		const randomPassword = generate({
			length: 16,
			numbers: true,
			lowercase: true,
			uppercase: true,
		});

		// Modified mysql configurations.
		dockerComposeConfig.services.mysql.environment = {
			MYSQL_DATABASE: 'wordpress',
			MYSQL_USER: 'wordpress',
			MYSQL_PASSWORD: randomPassword,
			MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
		};
		dockerComposeConfig.services.mysql.command = '--innodb-use-native-aio=0';
		dockerComposeConfig.services.mysql.labels = [`traefik.enable=false`];
		delete dockerComposeConfig.services.mysql.ports;

		// Modified wordpress configurations.
		dockerComposeConfig.services.wordpress.environment = {
			WORDPRESS_DB_HOST: 'mysql',
			WORDPRESS_DB_USER: 'wordpress',
			WORDPRESS_DB_PASSWORD: randomPassword,
			WORDPRESS_DB_NAME: 'wordpress',
		};
		dockerComposeConfig.services.wordpress.networks = ['proxy', 'default'];
		dockerComposeConfig.services.wordpress.labels = [
			`traefik.http.routers.${config.basename}.entrypoints=http`,
			`traefik.http.routers.${config.basename}.middlewares=redirect-to-https@docker`,
			`traefik.http.routers.${config.basename}.rule=Host(\`${config.host}\`)`,
			`traefik.http.routers.${config.basename}-secure.entrypoints=https`,
			`traefik.http.routers.${config.basename}-secure.rule=Host(\`${config.host}\`)`,
			`traefik.http.routers.${config.basename}-secure.tls=true`,
			`traefik.http.routers.${config.basename}-secure.tls.certresolver=letsencrypt`,
		];
		delete dockerComposeConfig.services.wordpress.ports;

		// Modified tests-wordpress configurations.
		dockerComposeConfig.services['tests-wordpress'].environment = {
			WORDPRESS_DB_HOST: 'mysql',
			WORDPRESS_DB_USER: 'wordpress',
			WORDPRESS_DB_PASSWORD: randomPassword,
			WORDPRESS_DB_NAME: 'tests-wordpress',
		};

		if (!disableCodeserver) {
			// Add code server
			dockerComposeConfig.services.codeserver = {
				depends_on: ['wordpress'],
				image: 'ivankristianto/code-server:latest',
				labels: [
					`traefik.http.routers.${config.basename}-code-secure.entrypoints=codeserver`,
					`traefik.http.routers.${config.basename}-code-secure.rule=Host(\`${config.host}\`)`,
					`traefik.http.routers.${config.basename}-code-secure.tls=true`,
					`traefik.http.routers.${config.basename}-code-secure.tls.certresolver=letsencrypt`,
				],
				volumes: dockerComposeConfig.services.wordpress.volumes.map((volume) =>
					volume.replace('/var/www/html', '/home/coder/project'),
				),
				networks: ['proxy', 'default'],
			};
		}

		if (disableTest) {
			delete dockerComposeConfig.services.phpunit;
			delete dockerComposeConfig.services['tests-cli'];
			delete dockerComposeConfig.services['tests-wordpress'];
			delete dockerComposeConfig.volumes['tests-wordpress'];
			delete dockerComposeConfig.volumes['phpunit-uploads'];
		}

		await fs.writeFile(config.dockerComposeConfigPath, yaml.dump(dockerComposeConfig));

		if (debug) {
			spinner.info(
				`Config:\n${JSON.stringify(
					config,
					null,
					4,
				)}\n\nDocker Compose Config:\n${JSON.stringify(dockerComposeConfig, null, 4)}`,
			);
			spinner.start();
		}

		spinner.text = `Config created in ${config.dockerComposeConfigPath}`;
	}

	/**
	 * Destroy wpenvbox application services
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @returns {Promise<object>}
	 */
	static async destroy({ spinner, debug }) {
		const config = await App.parseConfig({ spinner, debug });

		const { dockerComposeConfigPath, workDirectoryPath } = config;

		try {
			await fs.readdir(workDirectoryPath);
		} catch {
			spinner.text = 'Could not find any files to remove.';
			return;
		}

		spinner.info(
			'WARNING! This will remove Docker containers, volumes, and networks associated with the WordPress instance.',
		);

		const { yesDelete } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'yesDelete',
				message: 'Are you sure you want to continue?',
				default: false,
			},
		]);

		spinner.start();

		if (!yesDelete) {
			spinner.succeed(`Cancelled.`);
			return;
		}

		spinner.text = 'Removing WordPress docker containers.';

		await rm({
			config: dockerComposeConfigPath,
			commandOptions: ['--stop', '-v'],
			log: debug,
		});

		const directoryHash = path.basename(workDirectoryPath);

		spinner.text = 'Removing docker networks and volumes.';
		const getVolumes = `docker volume ls | grep "${directoryHash}" | awk '/ / { print $2 }'`;
		const removeVolumes = `docker volume rm $(${getVolumes})`;

		const command = `${removeVolumes}`;

		if (debug) {
			spinner.info(`Running command to remove volumes and networks:\n${command}\n`);
		}

		const { stdout } = await exec(command);
		if (debug && stdout) {
			// Disable reason: Logging information in debug mode.
			// eslint-disable-next-line no-console
			console.log(`Removed volumes: \n${stdout}`);
		}

		spinner.text = 'Removing local files.';

		await rimraf(workDirectoryPath);

		spinner.text = `Removed wpenvbox environment.`;
	}

	/**
	 * Parse .wp-env.json file and return config object
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @returns {Promise<object>}
	 */
	static async parseConfig({ spinner, debug }) {
		spinner.text = 'Reading .wp-env.json file.';
		const configPath = path.resolve('.wp-env.json');

		spinner.text = 'Parsing .wp-env.json file.';
		const config = await readConfig(configPath);
		config.debug = debug;
		config.port = process.env.WPENVPORT;
		config.workDirectoryPath = path.resolve(
			Config.getAppPath(),
			crypto.createHash('md5').update(configPath).digest('hex'),
		);
		config.dockerComposeConfigPath = path.resolve(
			config.workDirectoryPath,
			'docker-compose.yml',
		);
		config.basename = config.workDirectoryPath.split('/').pop();
		config.host = `${config.basename}.${process.env.DOMAIN}`;

		return config;
	}

	/**
	 * Reset wpenvbox application services to clean state
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @returns {Promise<object>}
	 */
	static async reset({ spinner, debug }) {
		const config = await App.parseConfig({ spinner, debug });

		spinner.text = `Resetting started...`;

		const tasks = [];

		// Start the database first to avoid race conditions where all tasks create
		// different docker networks with the same name.
		await upOne('mysql', {
			config: config.dockerComposeConfigPath,
			log: config.debug,
		});

		tasks.push(
			resetDatabase('development', config)
				.then(() => configureWordPress('development', config))
				.catch(() => {}),
		);

		await Promise.all(tasks);

		await WordPress.updateSiteUrl(config);

		spinner.succeed(`Environment has been reset.`);
	}

	/**
	 * Start the wpenvbox application services
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @param {string} options.container  Container to run into..
	 * @param {string} options.command   Command to run.
	 * @returns {Promise<void>}
	 */
	static async run({ spinner, debug, container, command }) {
		const config = await App.parseConfig({ spinner, debug });

		spinner.text = `Running \`${command.join(' ')}\` in '${container}'.`;

		const options = {
			config: config.dockerComposeConfigPath,
			commandOptions: ['--rm'],
			log: config.debug,
		};

		const response = await run(container, command, options);

		spinner.info(`${response.out}`);
		spinner.text = `Ran \`${command.join(' ')}\` in '${container}'.`;
	}

	/**
	 * Start the wpenvbox application services
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @returns {Promise<void>}
	 */
	static async start({ spinner, debug }) {
		const config = await App.parseConfig({ spinner, debug });

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
					spinner.text = 'Downloading WordPress source.';
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

		// @TODO: Add sanity check if codeserver and tests-wordpress service exist of not.
		const services = [
			'wordpress',
			'codeserver',
			// 'tests-wordpress'
		];
		await upMany(services, {
			config: config.dockerComposeConfigPath,
			log: config.debug,
		});

		if (config.coreSource === null) {
			const promises = [
				makeContentDirectoriesWritable('development', config),
				// @TODO: Work on the tests.
				// makeContentDirectoriesWritable('tests', config),
			];
			// Don't chown wp-content when it exists on the user's local filesystem.
			await Promise.all(promises);
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
		const actions = [
			retry(() => configureWordPress('development', config), {
				times: 2,
			}),
			// retry(() => configureWordPress('tests', config), { times: 2 }),
		];
		await Promise.all(actions);

		// Configure WordPress credentials.
		const credentials = await WordPress.configureWordPressInstance({
			config,
			spinner,
		});

		spinner.text = `Getting Code Server access.`;

		credentials.codeServerUrl = `https://${config.host}:8888`;
		credentials.codeServerPassword = await CodeServer.getPassword(config);

		spinner.info('Access to services:');
		const fields = 'siteUrl,userName,userEmail,userPass,codeServerUrl,codeServerPassword';
		const results = formatter.mappingField(fields, credentials);
		formatter.toList(fields, results);
		spinner.start();

		spinner.text = `Done!`;
	}

	/**
	 * Stop the wpenvbox application services
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {boolean} options.debug   True if debug mode is enabled.
	 * @returns {Promise<void>}
	 */
	static async stop({ spinner, debug }) {
		const config = await App.parseConfig({ spinner, debug });

		spinner.text = `Stopping wpenvbox application.`;
		await down({
			config: config.dockerComposeConfigPath,
			log: config.debug,
		});

		spinner.text = `Stopped wpenvbox application.`;
	}
}

export default App;
