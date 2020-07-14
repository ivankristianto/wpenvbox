import { down, logs, ps, restartAll, run, upAll } from 'docker-compose';
import Config from './config';

class Proxy {
	/**
	 *
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
	 *
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
	 *
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
	 *
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
	 *
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
	 *
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
