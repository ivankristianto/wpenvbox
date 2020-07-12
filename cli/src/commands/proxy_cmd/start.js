import { upAll } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'start';
exports.desc = 'Start proxy server';
exports.builder = {};
exports.handler = async function () {
	try {
		await upAll({
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
			log: true,
		});
	} catch (err) {
		log.error(err);
	}
};
