import { down, logs, ps, restartAll, run, upAll } from 'docker-compose';
import { exec, mkdir, rm, sed } from 'shelljs';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import User from './user';
import Config from './config';

class Proxy {
	/**
	 * Init wpenvbox environments
	 *
	 * @param {object} options Options object
	 * @param {object} options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async init({ spinner }) {
		spinner.info('Creating directory ~/.wpenvbox');
		mkdir('-p', Config.getDirPath());

		// Inquire users for the configurations.
		spinner.text = 'Creating default config file.';
		const defaults = Config.defaultConfig();
		const answers = await inquirer.prompt(Config.getConfigQuestions());
		const config = Object.assign(defaults, answers);
		await Config.write(config);

		spinner.info(`Wrote configs to file ${Config.getConfigFile()}\n`);

		spinner.text = 'Creating user auth file.';
		const userAnswers = await inquirer.prompt(User.getUserInquireQuestions());
		await User.init({ spinner, user: userAnswers.user, password: userAnswers.password });
		spinner.info(`Wrote user auth to file ${Config.getUserFile()}\n`);

		spinner.start();

		spinner.text = 'Creating proxy server.';
		spinner.info(`Clone wpenvbox/proxy to ${Config.getProxyPath()}`);
		if (await fs.pathExists(Config.getProxyPath())) {
			spinner.info(`${Config.getProxyPath()} exist, deleting the folder`);
			rm('-rf', Config.getProxyPath());
		}
		spinner.start();
		exec(`git clone ${Config.getProxyGit()} ${Config.getProxyPath()}`);

		spinner.info(
			`Create acme.json file in ${Config.getProxyPath()} and make permission to 600`,
		);
		exec(
			`touch ${Config.getProxyPath()}/acme.json && chmod 600 ${Config.getProxyPath()}/acme.json`,
		);

		spinner.info(
			`Update proxy/traefik.yml file in ${Config.getProxyPath()} and make permission to 600`,
		);
		sed('-i', '{{DEFAULTEMAIL}}', answers.defaultEmail, `${Config.getProxyPath()}/traefik.yml`);

		spinner.info(`Create docker network: proxy`);
		exec(`docker network create proxy`);

		spinner.text = 'Done!';
	}

	/**
	 * See Proxy Server logs
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async logs({ spinner }) {
		spinner.text = `Getting Proxy Server logs.`;
		const response = await logs(['proxy'], {
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			follow: false,
		});
		spinner.info(response.out);
		spinner.text = `Done!`;
	}

	/**
	 * See Docker Processlist
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async ps({ spinner }) {
		spinner.text = `Getting Docker Server processlist`;
		const response = await ps({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
		});
		spinner.info(response.out);
		spinner.text = `Done!`;
	}

	/**
	 * Restart Proxy Server
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @param {Array}  options.command A CLI command to run to.
	 * @returns {Promise<void>}
	 */
	static async run({ spinner, command }) {
		spinner.text = `Running ${command.join(' ')} in Proxy Server...`;
		const response = await run('proxy', command, {
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
		spinner.info(`Response: ${response.out}`);
		spinner.succeed(`Ran \`${command.join(' ')}\` in proxy server'.`);
	}

	/**
	 * Restart Proxy Server
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async restart({ spinner }) {
		spinner.text = `Restarting Proxy Server...`;
		await restartAll({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
		spinner.text = `Proxy Server restarted.`;
	}

	/**
	 * Start Proxy Server
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async start({ spinner }) {
		spinner.text = `Starting Proxy Server...`;
		await upAll({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
		spinner.text = `Proxy Server started.`;
	}

	/**
	 * Stop Proxy Server
	 *
	 * @param {object}  options Options object
	 * @param {object}  options.spinner A CLI spinner which indicates progress.
	 * @returns {Promise<void>}
	 */
	static async stop({ spinner }) {
		spinner.text = `Stopping Proxy Server...`;
		await down({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
		spinner.text = `Proxy Server stopped.`;
	}
}

export default Proxy;
