import ora from 'ora';
import util from 'util';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { rm } from 'docker-compose';
import { readConfig } from '@wordpress/env/lib/config';

const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);

exports.command = 'destroy';
exports.desc = 'Destroy wp-env box services';
exports.builder = {
	debug: {
		default: false,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = async function (argv) {
	const { debug } = argv;
	const spinner = ora().start();

	const configPath = path.resolve('.wp-env.json');
	const { dockerComposeConfigPath, workDirectoryPath } = await readConfig(configPath);

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

	spinner.succeed(`Removed WordPress environment.`);
};
