import log from '../utils/logger';

exports.command = 'app';
exports.desc = 'Command to manage applications';
exports.builder = function (yargs) {
	return yargs.commandDir('app_cmd');
};
exports.handler = async function () {
	log.info('Use --help argument to get available subcommands');
};
