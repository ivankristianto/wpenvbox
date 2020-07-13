import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';

class Config {
	static loadEnv() {
		dotenv.config({ path: Config.getConfigFile() });
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

	static defaultConfig() {
		return {
			apiUrl: '',
			domain: '',
			defaultEmail: 'ssl@wpenvbox.com',
			wpEnvPort: 80,
		};
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
