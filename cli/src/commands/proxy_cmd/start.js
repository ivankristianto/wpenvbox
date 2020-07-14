import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'start';
exports.desc = 'Start proxy server';
exports.builder = {};
exports.handler = withSpinner(Proxy.start);
