import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import yaml from 'js-yaml';
import { readConfig } from '@wordpress/env/lib/config';
import buildDockerComposeConfig from '@wordpress/env/lib/build-docker-compose-config';
import log from '../../utils/logger';

exports.command = 'create';
exports.desc = 'Create new wp-env box';
exports.builder = {
	debug: {
		default: false,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = async function (argv) {
	try {
		const { debug } = argv;
		const spinner = ora().start();
		const configPath = path.resolve('.wp-env.json');

		const config = await readConfig(configPath);

		await fs.mkdir(config.workDirectoryPath, { recursive: true });

		config.port = process.env.WPENVPORT;

		const DOMAIN = config.workDirectoryPath.split('/').pop();
		const FULLURL = `${DOMAIN}.${process.env.DOMAIN}`;
		const dockerComposeConfig = buildDockerComposeConfig(config);

		// Add networks: proxy
		dockerComposeConfig.networks = { proxy: { external: { name: 'proxy' } } };

		// Modified mysql configurations.
		dockerComposeConfig.services.mysql.environment = {
			MYSQL_DATABASE: 'wordpress',
			MYSQL_USER: 'wpuser',
			MYSQL_PASSWORD: 'wppass123',
			MYSQL_RANDOM_ROOT_PASSWORD: '1',
		};
		dockerComposeConfig.services.mysql.command = '--innodb-use-native-aio=0';
		dockerComposeConfig.services.mysql.labels = [`traefik.enable=false`];
		delete dockerComposeConfig.services.mysql.ports;

		// Modified wordpress configurations.
		dockerComposeConfig.services.wordpress.environment = {
			WORDPRESS_DB_HOST: 'mysql',
			WORDPRESS_DB_USER: 'wpuser',
			WORDPRESS_DB_PASSWORD: 'wppass123',
			WORDPRESS_DB_NAME: 'wordpress',
		};
		dockerComposeConfig.services.wordpress.networks = ['proxy', 'default'];
		dockerComposeConfig.services.wordpress.labels = [
			`traefik.http.routers.${DOMAIN}.entrypoints=http`,
			`traefik.http.routers.${DOMAIN}.middlewares=redirect-to-https@docker`,
			`traefik.http.routers.${DOMAIN}.rule=Host(\`${FULLURL}\`)`,
			`traefik.http.routers.${DOMAIN}-secure.entrypoints=https`,
			`traefik.http.routers.${DOMAIN}-secure.rule=Host(\`${FULLURL}\`)`,
			`traefik.http.routers.${DOMAIN}-secure.tls=true`,
			`traefik.http.routers.${DOMAIN}-secure.tls.certresolver=letsencrypt`,
		];
		delete dockerComposeConfig.services.wordpress.ports;

		// Add code server
		dockerComposeConfig.services.codeserver = {
			depends_on: ['wordpress'],
			image: 'codercom/code-server',
			labels: [
				`traefik.http.routers.${DOMAIN}-code-secure.entrypoints=codeserver`,
				`traefik.http.routers.${DOMAIN}-code-secure.rule=Host(\`${FULLURL}\`)`,
				`traefik.http.routers.${DOMAIN}-code-secure.tls=true`,
				`traefik.http.routers.${DOMAIN}-code-secure.tls.certresolver=letsencrypt`,
			],
			volumes: dockerComposeConfig.services.wordpress.volumes.map((volume) =>
				volume.replace('/var/www/html', '/home/coder/project'),
			),
			networks: ['proxy', 'default'],
		};

		// @TODO: Revisit this later
		// For now removing things we don't need
		delete dockerComposeConfig.services.phpunit;
		delete dockerComposeConfig.services['tests-cli'];
		delete dockerComposeConfig.services['tests-wordpress'];
		delete dockerComposeConfig.volumes['tests-wordpress'];
		delete dockerComposeConfig.volumes['phpunit-uploads'];

		await fs.writeFile(config.dockerComposeConfigPath, yaml.dump(dockerComposeConfig));

		if (debug) {
			spinner.info(
				`Config:\n${JSON.stringify(
					config,
					null,
					4,
				)}\n\nDocker Compose Config:\n${JSON.stringify(dockerComposeConfig, null, 4)}`,
			);
			spinner.start();
		}

		spinner.succeed(`Config created in ${config.dockerComposeConfigPath}`);
	} catch (err) {
		log.error(err);
	}
};
