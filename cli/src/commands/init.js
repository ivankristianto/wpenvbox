import inquirer from 'inquirer';
import { execSync } from 'child_process';
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
	console.log(`Write env file to ${Config.getConfigFile()}\n`);

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

	await execSync(
		`htpasswd -b -c ${Config.getUserFile()} ${userAnswers.user} ${userAnswers.password}`,
	);

	console.log(`Write htpasswd auth to file ${Config.getUserFile()}\n`);

	// 3. Ask for user and input password, run htpasswd to .wpenvusers
	// 4. Create docker network: proxy
	// 5. Clone traefik repo
	// 6. Add traefik docker-compose.yml path to env
};
