import { logs } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'logs';
exports.desc = 'See proxy server logs';
exports.builder = {};
exports.handler = async function () {
	try {
		const response = await logs(['proxy'], {
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
			follow: false,
		});
		log.info(response.out);
	} catch (err) {
		log.error(err);
	}
};
