module.exports = {
	extends: ['@10up/eslint-config/node'],
	env: {
		node: true,
		mocha: true,
	},
	rules: {
		'func-names': 0,
		'no-param-reassign': 0,
	},
};
