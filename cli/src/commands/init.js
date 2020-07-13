import inquirer from 'inquirer';
import { mkdir, exec, rm } from 'shelljs';
import fs from 'fs-extra';
import Config from '../classes/config';
import User from '../classes/user';
import { validateNotEmpty } from '../utils/promp-validators';
import log from '../utils/logger';

exports.command = 'init';
exports.desc = 'Init config and environment';
exports.builder = {};
exports.handler = async function () {
	log.info('Creating directory ~/.wpenvbox');
	mkdir('-p', Config.getDirPath());

	const defaults = Config.defaultConfig();

	const questions = [
		{
			name: 'apiUrl',
			type: 'input',
			message: 'What is the url for the proxy dashboard and api: ',
			default: process.env.APIURL,
			validate: validateNotEmpty,
		},
		{
			name: 'domain',
			type: 'input',
			message: 'What is the main domain: ',
			default: process.env.DOMAIN,
			validate: validateNotEmpty,
		},
		{
			name: 'defaultEmail',
			type: 'input',
			message: 'Default email address for notification and letsencrypt: ',
			default: process.env.DEFAULTEMAIL,
			validate: validateNotEmpty,
		},
	];

	const answers = await inquirer.prompt(questions);

	const config = Object.assign(defaults, answers);

	await Config.write(config);
	log.success(`Write env file to ${Config.getConfigFile()}\n`);

	const users = [
		{
			name: 'user',
			type: 'input',
			message: 'What is username to access dashboard: ',
			validate: validateNotEmpty,
		},
		{
			name: 'password',
			type: 'password',
			message: 'What is the user password: ',
			validate: validateNotEmpty,
		},
	];

	const userAnswers = await inquirer.prompt(users);

	await User.init(userAnswers.user, userAnswers.password);
	log.success(`Write htpasswd auth to file ${Config.getUserFile()}\n`);

	log.info(`Clone wpenvbox/proxy to ${Config.getProxyPath()}`);
	if (await fs.pathExists(Config.getProxyPath())) {
		log.info(`${Config.getProxyPath()} exist, deleting the folder`);
		rm('-rf', Config.getProxyPath());
	}
	exec(`git clone ${Config.getProxyGit()} ${Config.getProxyPath()}`);

	log.info(`Create acme.json file in ${Config.getProxyPath()} and make permission to 600`);
	exec(
		`touch ${Config.getProxyPath()}/acme.json && chmod 600 ${Config.getProxyPath()}/acme.json`,
	);

	log.info(`Create docker network: proxy`);
	exec(`docker network create proxy`);
};
