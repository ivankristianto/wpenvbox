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

	static async changeDefaultAdminUser(config) {
		const options = {
			config: config.dockerComposeConfigPath,
			commandOptions: ['--rm'],
			log: true, // config.debug,
		};

		await run(
			'cli',
			[
				'wp',
				'user',
				'create',
				config.userName,
				config.userEmail,
				`--role=editor`,
				`--user_pass=${config.userPass}`,
			],
			options,
		);

		const command = `wp user delete $(wp user list --role=administrator --field=ID) --reassign=$(wp user get ${config.userName} --field=ID)`;

		await run('cli', ['/bin/sh', '-c', command], options);

		await run('cli', ['wp', 'user', 'set-role', config.userName, `administrator`], options);
	}
}

export default WordPress;
