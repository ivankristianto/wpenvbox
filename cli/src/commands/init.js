import Proxy from '../classes/proxy';
import withSpinner from '../utils/withSpinner';

exports.command = 'init';
exports.desc = 'Init config and environment';
exports.builder = {};
exports.handler = withSpinner(Proxy.init);
