import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'destroy';
exports.desc = 'Destroy wp-env box services';
exports.builder = {
	debug: {
		default: true,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.destroy);
