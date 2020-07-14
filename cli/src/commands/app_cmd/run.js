import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'run <container> [command..]';
exports.desc = 'Run cli command to wp-env box services';
exports.builder = {};
exports.handler = withSpinner(App.run);
