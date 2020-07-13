import Config from '../../classes/config';
import User from '../../classes/user';
import log from '../../utils/logger';

exports.command = 'add <user> <password>';
exports.desc = 'Add a new user';
exports.builder = {};
exports.handler = async function (argv) {
	try {
		const { user, password } = argv;

		const response = User.add(user, password);

		if (response) {
			log.success(`Write htpasswd basic auth to file ${Config.getUserFile()}\n`);
		}
	} catch (err) {
		log.error(err);
	}
};
