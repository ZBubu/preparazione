const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    {
        ignores: ['node_modules/', 'coverage/', 'dist/'],
    },
    {
        files: ['**/*.js'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: globals.node,
        },

        rules: {
            ...js.configs.recommended.rules,

            // Variables
            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            // Best practices
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: 'error',
            curly: 'error',

            // Error handling
            'no-throw-literal': 'error',
        },
    },
    {
        files: ['src/public/**/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: globals.browser,
        },
    },

    // Must be last to disable conflicting formatting rules
    eslintConfigPrettier,
];
