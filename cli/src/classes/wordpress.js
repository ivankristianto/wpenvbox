import { run } from 'docker-compose';

class WordPress {
	static async updateSiteUrl(config) {
		const options = {
			config: config.dockerComposeConfigPath,
			commandOptions: ['--rm'],
			log: config.debug,
		};

		await run(
			'cli',
			['wp', 'search-replace', 'http://localhost:80', `https://${config.host}`],
			options,
		);
	}
}

export default WordPress;
