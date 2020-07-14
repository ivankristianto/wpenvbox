import User from '../../classes/user';
import withSpinner from '../../utils/withSpinner';

exports.command = 'add <user> <password>';
exports.desc = 'Add a new user';
exports.builder = {};
exports.handler = withSpinner(User.add);
