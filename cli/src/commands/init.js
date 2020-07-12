import inquirer from 'inquirer';
import Config from '../utils/config';
import { validateNotEmpty } from '../utils/promp-validators';

exports.command = 'init';
exports.desc = 'Init config and environment';
exports.builder = {};
exports.handler = async function () {
	const defaults = Config.defaultConfig();

	const questions = [
		{
			name: 'apiUrl',
			type: 'input',
			message: 'What is the url for the proxy dashboard and api: ',
			default: 'dashboard.yourdomain.com',
			validate: validateNotEmpty,
		},
		{
			name: 'domain',
			type: 'input',
			message: 'What is the main domain: ',
			default: 'yourdomain.com',
			validate: validateNotEmpty,
		},
		{
			name: 'defaultEmail',
			type: 'input',
			message: 'Default email address for notification and letsencrypt: ',
			default: 'ssl@wpenvbox.com',
			validate: validateNotEmpty,
		},
	];

	const answers = await inquirer.prompt(questions);

	const config = Object.assign(defaults, answers);

	await Config.write(config);
	// 1. Ask for api domain
	// 2. Ask for main domain
	// 3. Ask for user and input password, run htpasswd to .wpenvusers
	// 4. Create docker network: proxy
	// 5. Clone traefik repo
	// 6. Add traefik docker-compose.yml path to env
};
