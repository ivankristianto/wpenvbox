import { upAll } from 'docker-compose';
import Config from '../../classes/config';
import log from '../../utils/logger';

exports.command = 'start';
exports.desc = 'Start proxy server';
exports.builder = {};
exports.handler = async function () {
	try {
		await upAll({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			log: true,
		});
	} catch (err) {
		log.error(err);
	}
};
