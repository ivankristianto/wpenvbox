import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'destroy';
exports.desc = 'Destroy wp-env box services';
exports.builder = {};
exports.handler = withSpinner(App.destroy);
