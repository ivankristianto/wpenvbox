import log from '../utils/logger';

exports.command = 'user';
exports.desc = 'Command to manage traefik dashboard user';
exports.builder = function (yargs) {
	return yargs.commandDir('user_cmd');
};
exports.handler = async function () {
	log.info('Use --help argument to get available subcommands');
};
