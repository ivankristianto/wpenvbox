import Proxy from '../../classes/proxy';
import withSpinner from '../../utils/withSpinner';

exports.command = 'ps';
exports.desc = 'See current docker process list';
exports.builder = {};
exports.handler = withSpinner(Proxy.ps);
