import Config from '../../classes/config';
import User from '../../classes/user';
import log from '../../utils/logger';

exports.command = 'delete <user>';
exports.desc = 'Delete a user';
exports.builder = {};
exports.handler = async function (argv) {
	try {
		const { user } = argv;

		const response = User.delete(user);

		if (response) {
			log.success(`Removed ${user} basic auth to file ${Config.getUserFile()}\n`);
		}
	} catch (err) {
		log.error(err);
	}
};
