import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'reset';
exports.desc = 'Reset wp-env box data';
exports.builder = {};
exports.handler = withSpinner(App.reset);
