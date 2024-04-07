module.exports = {
	root: true,
	extends: ['../../.eslintrc.cjs'],
	parserOptions: {
		ecmaVersion: 'latest',
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['./src/index.ts'],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
