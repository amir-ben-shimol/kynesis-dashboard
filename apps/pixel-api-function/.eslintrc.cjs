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
			files: ['./src/services/logger.ts'],
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['./**/*.d.ts'],
			rules: {
				'@typescript-eslint/consistent-type-definitions': 'off',
			},
		},
	],
};
