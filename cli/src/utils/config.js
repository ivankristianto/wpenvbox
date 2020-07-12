import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';

class Config {
	static loadEnv() {
		dotenv.config({ path: Config.getConfigFile() });
	}

	static getConfigFile() {
		return path.join(os.homedir(), '.wpenvbox.env');
	}

	static defaultConfig() {
		return {
			apiUrl: '',
			domain: '',
			defaultEmail: 'ssl@wpenvbox.com',
			proxyPath: '/Users/ivankristianto/Works/wpenvbox/traefik-proxy',
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

	static async read() {
		let readConfig = {};

		if (await fs.exists(Config.getConfigFile())) {
			readConfig = await fs.readJson(Config.getConfigFile());
		}

		return { ...readConfig };
	}
}

export default Config;
