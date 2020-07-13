/**
 * Internal dependencies
 */
import yargs from 'yargs';
import log from './utils/logger';
import Config from './classes/config';

// eslint-disable-next-line consistent-return
function main() {
	try {
		Config.loadEnv();
		return yargs
			.commandDir('commands')
			.demandCommand()
			.help()
			.wrap(Math.min(120, yargs.terminalWidth())).argv;
	} catch (e) {
		log.error(e.toString());
	}
}

main();
