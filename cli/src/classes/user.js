import { exec } from 'shelljs';
import Config from './config';
import { validateNotEmpty } from '../utils/promp-validators';

class User {
	/**
	 * Add new user to basic auth
	 *
	 * @param {object} options Options object
	 * @param {object} options.spinner A CLI spinner which indicates progress.
	 * @param {string} options.user User to add to.
	 * @param {string} options.password Plain text password.
	 */
	static async add({ spinner, user, password }) {
		spinner.info(`Adding/Updating ${user} to ${Config.getUserFile()} file...`);

		const response = exec(`htpasswd -b ${Config.getUserFile()} ${user} ${password}`);

		if (response.code !== 0) {
			throw new Error('Add new user failed.');
		}
		spinner.text = 'Done!';
	}

	/**
	 * Delete user from auth file
	 *
	 * @param {object} options Options object
	 * @param {object} options.spinner A CLI spinner which indicates progress.
	 * @param {string} options.user User to add to.
	 */
	static async delete({ spinner, user }) {
		spinner.info(`Adding/Updating ${user} to ${Config.getUserFile()} file...`);

		const response = exec(`htpasswd -D ${Config.getUserFile()} ${user}`);

		if (response.code !== 0) {
			throw new Error('Add new user failed.');
		}
		spinner.text = 'Done!';
	}

	/**
	 * Get inquire questions
	 *
	 * @returns {({name: string, type: string, message: string, validate: validateNotEmpty}|{name: string, type: string, message: string, validate: validateNotEmpty})[]}
	 */
	static getUserInquireQuestions() {
		return [
			{
				name: 'user',
				type: 'input',
				message: 'What is username to access dashboard: ',
				validate: validateNotEmpty,
			},
			{
				name: 'password',
				type: 'password',
				message: 'What is the user password: ',
				validate: validateNotEmpty,
			},
		];
	}

	/**
	 * Init new user to basic auth file
	 *
	 * @param {object} options Options object
	 * @param {object} options.spinner A CLI spinner which indicates progress.
	 * @param {string} options.user User to add to.
	 * @param {string} options.password Plain text password.
	 */
	static async init({ spinner, user, password }) {
		spinner.info(`Creating ${Config.getUserFile()} file...`);

		const response = exec(`htpasswd -b -c ${Config.getUserFile()} ${user} ${password}`);

		if (response.code !== 0) {
			throw new Error('Add new user failed.');
		}
		spinner.text = 'Done!';
	}
}

export default User;
