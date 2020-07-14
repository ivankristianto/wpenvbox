import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'stop';
exports.desc = 'Stop wp-env box services';
exports.builder = {
	debug: {
		default: true,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.stop);
