import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'clean';
exports.desc = 'Clean wp-env box services';
exports.builder = {
	debug: {
		default: false,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.clean);
