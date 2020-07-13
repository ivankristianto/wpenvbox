import ora from 'ora';
import path from 'path';
import { readConfig } from '@wordpress/env/lib/config';
import WordPress from '../../classes/wordpress';

exports.command = 'stop';
exports.desc = 'Stop wp-env box services';
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

	await WordPress.stop(config);

	spinner.succeed(`Stopped wp-env box.`);
};
