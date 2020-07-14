import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'logs';
exports.desc = 'See proxy server logs';
exports.builder = {};
exports.handler = withSpinner(Proxy.logs);
