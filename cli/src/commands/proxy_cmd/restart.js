import { restartAll } from 'docker-compose';
import Config from '../../classes/config';
import log from '../../utils/logger';

exports.command = 'restart';
exports.desc = 'Restart proxy server';
exports.builder = {};
exports.handler = async function () {
	try {
		await restartAll({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
	} catch (err) {
		log.error(err);
	}
};
