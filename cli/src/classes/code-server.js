import { exec } from 'docker-compose';

class CodeServer {
	static async getPassword(config) {
		const options = {
			config: config.dockerComposeConfigPath,
			// commandOptions: ['-T'],
			log: config.debug,
		};

		const response = await exec(
			'codeserver',
			['cat', '/home/coder/.config/code-server/config.yaml'],
			options,
		);

		const regex = /password:\s(.*)/;
		const password = regex.exec(response.out);
		return password[1];
	}
}

export default CodeServer;
