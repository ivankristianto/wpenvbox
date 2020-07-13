import ora from 'ora';
import { run } from 'docker-compose';
import path from 'path';
import { readConfig } from '@wordpress/env/lib/config';

exports.command = 'run <container> [command..]';
exports.desc = 'Run cli command to wp-env box services';
exports.builder = {};
exports.handler = async function (argv) {
	const { container } = argv;
	let { command } = argv;
	const spinner = ora().start();
	const configPath = path.resolve('.wp-env.json');

	try {
		const config = await readConfig(configPath);

		command = command.join(' ');

		spinner.text = `Running \`${command}\` in '${container}'.`;

		const options = {
			config: config.dockerComposeConfigPath,
			commandOptions: ['--rm'],
			log: config.debug,
		};

		const response = await run(container, command.split(' '), options);

		spinner.info(`Response: ${response.out}`);
		spinner.succeed(`Ran \`${command}\` in '${container}'.`);
	} catch (err) {
		spinner.fail(`Error ${err.err}.`);
	}
};
