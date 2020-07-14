import User from '../../classes/user';
import withSpinner from '../../utils/withSpinner';

exports.command = 'delete <user>';
exports.desc = 'Delete a user';
exports.builder = {};
exports.handler = withSpinner(User.delete);
