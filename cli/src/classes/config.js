import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { validateNotEmpty } from '../utils/promp-validators';

class Config {
	static loadEnv() {
		dotenv.config({ path: Config.getConfigFile() });
	}

	static getDirPath() {
		return path.join(os.homedir(), '.wpenvbox');
	}

	static getConfigFile() {
		return path.join(os.homedir(), '.wpenvbox/env');
	}

	static getUserFile() {
		return path.join(os.homedir(), '.wpenvbox/user');
	}

	static getProxyPath() {
		return path.join(os.homedir(), '.wpenvbox/proxy');
	}

	static getAppPath() {
		return path.join(os.homedir(), '.wpenvbox/app');
	}

	static getProxyGit() {
		return 'https://github.com/ivankristianto/wpenvbox-proxy.git';
	}

	static defaultConfig() {
		return {
			apiUrl: '',
			domain: '',
			defaultEmail: 'ssl@wpenvbox.com',
			wpEnvPort: 80,
		};
	}

	static getConfigQuestions() {
		return [
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
	}

	static async write(config) {
		const stream = fs.createWriteStream(Config.getConfigFile());

		for (const [key, value] of Object.entries(config)) {
			const exportString = `${key.toUpperCase()}=${value}\n`;
			stream.write(exportString);
		}
	}
}

export default Config;
