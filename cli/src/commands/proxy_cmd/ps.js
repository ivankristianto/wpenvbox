import { ps } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'ps';
exports.desc = 'See proxy server process list';
exports.builder = {};
exports.handler = async function () {
	try {
		const response = await ps({
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
		});
		log.info(response.out);
	} catch (err) {
		log.error(err);
	}
};
