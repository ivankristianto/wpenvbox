import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'start';
exports.desc = 'Start wp-env box services';
exports.builder = {};
exports.handler = withSpinner(App.start);
