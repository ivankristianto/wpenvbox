import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'create';
exports.desc = 'Create new wp-env box';
exports.builder = {};
exports.handler = withSpinner(App.create);
