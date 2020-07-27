import App from '../../classes/app';
import withSpinner from '../../utils/withSpinner';

exports.command = 'create';
exports.desc = 'Create new wp-env box';
exports.builder = {
	codeserver: {
		default: true,
		describe: 'Enable/Disable code server',
		type: 'boolean',
	},
};
exports.handler = withSpinner(App.create);
