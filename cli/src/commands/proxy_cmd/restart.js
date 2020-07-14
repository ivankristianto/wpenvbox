import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'restart';
exports.desc = 'Restart proxy server';
exports.builder = {};
exports.handler = withSpinner(Proxy.restart);
