import { ps } from 'docker-compose';
import Config from '../../classes/config';
import log from '../../utils/logger';

exports.command = 'ps';
exports.desc = 'See proxy server process list';
exports.builder = {};
exports.handler = async function () {
	try {
		const response = await ps({
			config: `${Config.getProxyPath()}/docker-compose.yml`,
		});
		log.info(response.out);
	} catch (err) {
		log.error(err);
	}
};
