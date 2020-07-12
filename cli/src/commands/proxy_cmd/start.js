import dotenv from 'dotenv';
import { upAll } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'start';
exports.desc = 'Start proxy server';
exports.builder = {};
exports.handler = async function () {
	try {
		dotenv.config();
		await upAll({
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
			log: true,
		});
	} catch (err) {
		log.error(err);
	}
};
