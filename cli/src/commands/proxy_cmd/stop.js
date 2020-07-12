import { down } from 'docker-compose';
import log from '../../utils/logger';

exports.command = 'stop';
exports.desc = 'Stop proxy server';
exports.builder = {};
exports.handler = async function () {
	try {
		await down({
			config: `${process.env.PROXYPATH}/docker-compose.yml`,
			log: true,
		});
	} catch (err) {
		log.error(err);
	}
};
