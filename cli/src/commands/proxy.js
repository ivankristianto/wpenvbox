import log from '../utils/logger';

exports.command = 'proxy';
exports.desc = 'Command to manage proxy';
exports.builder = function (yargs) {
	return yargs.commandDir('proxy_cmd');
};
exports.handler = async function () {
	log.info('Use --help argument to get available subcommands');
};
