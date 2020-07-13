import { execSync } from 'child_process';
import Config from './config';

class User {
	/**
	 * Init new basic auth file
	 *
	 * @param {string} user username to add to basic auth
	 * @param {string} password password in plain text
	 * @returns {Promise<void>}
	 */
	static async init(user, password) {
		try {
			await execSync(`htpasswd -b -c ${Config.getUserFile()} ${user} ${password}`);

			return true;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Add new user to basic auth
	 *
	 * @param {string} user username to add to basic auth
	 * @param {string} password password in plain text
	 * @returns {Promise<void>}
	 */
	static async add(user, password) {
		try {
			await execSync(`htpasswd -b ${Config.getUserFile()} ${user} ${password}`);

			return true;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Delete user from basic auth
	 *
	 * @param {string} user username to add to basic auth
	 * @returns {Promise<void>}
	 */
	static async delete(user) {
		try {
			await execSync(`htpasswd -D ${Config.getUserFile()} ${user}`);

			return true;
		} catch (err) {
			throw new Error(err);
		}
	}
}

export default User;
