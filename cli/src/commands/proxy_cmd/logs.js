import { logs } from 'docker-compose';
import Config from '../../classes/config';
import log from '../../utils/logger';

exports.command = 'logs';
exports.desc = 'See proxy server logs';
exports.builder = {};
exports.handler = async function () {
	try {
		const response = await logs(['proxy'], {
			config: `${Config.getProxyPath()}/docker-compose.yml`,
			follow: false,
		});
		log.info(response.out);
	} catch (err) {
		log.error(err);
	}
};
