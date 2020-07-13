import ora from 'ora';
import { run } from 'docker-compose';
import path from 'path';
import { readConfig } from '@wordpress/env/lib/config';

exports.command = 'run [command..]';
exports.desc = 'Run cli command to wp-env box services';
exports.builder = {};
exports.handler = async function (argv) {
	let { command } = argv;
	const spinner = ora().start();
	const configPath = path.resolve('.wp-env.json');

	try {
		const config = await readConfig(configPath);

		command = command.join(' ');
		const container = 'cli';

		spinner.text = `Running \`${command}\` in '${container}'.`;

		const options = {
			config: config.dockerComposeConfigPath,
			commandOptions: ['--rm'],
			log: config.debug,
		};

		const response = await run('cli', command.split(' '), options);

		spinner.info(`Response: ${response.out}`);
		spinner.succeed(`Ran \`${command}\` in '${container}'.`);
	} catch (err) {
		spinner.fail(`Error ${err.err}.`);
	}
};
