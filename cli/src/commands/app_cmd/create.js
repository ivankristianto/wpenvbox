import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'create';
exports.desc = 'Create new wp-env box';
exports.builder = {
	debug: {
		default: false,
		describe: 'Show debug process',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.create);
