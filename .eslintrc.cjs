/* eslint-env node */
module.exports = {
  root: true,
  env: {
    node: true,
    es2023: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js',
    '*.cjs',
    '*.mjs',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    'eqeqeq': ['error', 'always'],
    'no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/routes',
            from: './src/services/ai/providers',
            message:
              'Routes/controllers must not import AI provider implementations directly. Use ITicketAnalyzerService.',
          },
          {
            target: './src/controllers',
            from: './src/services/ai/providers',
            message:
              'Controllers must not import AI provider implementations directly. Use ILLMProvider via factory.',
          },
          {
            target: './src/services',
            from: ['express', './src/middleware', './src/routes', './src/controllers'],
            message: 'Services must be framework-free (Clean Architecture).',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
};
