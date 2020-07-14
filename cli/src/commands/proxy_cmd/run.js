import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'run [command..]';
exports.desc = 'Run cli in proxy server';
exports.builder = {};
exports.handler = withSpinner(Proxy.run);
