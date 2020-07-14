import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'stop';
exports.desc = 'Stop proxy server';
exports.builder = {};
exports.handler = withSpinner(Proxy.stop);
