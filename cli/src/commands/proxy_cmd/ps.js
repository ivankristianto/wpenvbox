import dotenv from 'dotenv';
import { ps } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'ps';
exports.desc = 'See proxy server process list';
exports.builder = {};
exports.handler = async function () {
	try {
		dotenv.config();
		const response = await ps({
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
		});
		log.info(response.out);
	} catch (err) {
		log.error(err);
	}
};
