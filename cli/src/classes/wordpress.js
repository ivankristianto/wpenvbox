import { run } from 'docker-compose';
import { generate } from 'generate-password';

class WordPress {
	static async configureWordPressInstance({ config, spinner }) {
		spinner.text = 'Updating WordPress default url...';

		// Update site url from localhost to default domain.
		await WordPress.updateSiteUrl(config);

		spinner.text = 'Creating new WordPress administrator...';

		// Remove default admin password and create new administrator user.
		config.userName = generate({
			length: 8,
			lowercase: true,
		});
		const domain = process.env.DOMAIN === 'localhost' ? 'wpenvbox.com' : process.env.DOMAIN;
		config.userEmail = `${config.userName}@${domain}`;
		config.userPass = generate({
			length: 16,
			numbers: true,
			lowercase: true,
			uppercase: true,
		});
		await WordPress.changeDefaultAdminUser(config);

		return {
			siteUrl: `https://${config.host}`,
			userName: config.userName,
			userEmail: config.userEmail,
			userPass: config.userPass,
		};
	}

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
