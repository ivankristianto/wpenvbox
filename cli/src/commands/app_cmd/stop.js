import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'stop';
exports.desc = 'Stop wp-env box services';
exports.builder = {};
exports.handler = withSpinner(App.stop);
