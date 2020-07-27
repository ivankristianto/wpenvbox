import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'create';
exports.desc = 'Create new wp-env box';
exports.builder = {
	disableCodeserver: {
		default: false,
		describe: 'Enable/Disable code server',
		type: 'boolean',
	},
	disableTest: {
		default: true,
		describe: 'Enable/Disable tests environment',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.create);
