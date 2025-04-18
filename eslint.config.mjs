module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import',
    'simple-import-sort',
    'unused-imports',
    'eslint-plugin-import',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    '@typescript-eslint/no-empty-function': ['warn'],
    '@typescript-eslint/no-unused-vars': ['off', { varsIgnorePattern: '^_' }],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-cycle': 2,

    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Package nest related
          ['^@nest'],
          // Other package
          ['^\\w'],
          // App - Config
          ['^@config'],
          // App - Constants
          ['^@constants'],
          // Dbs - Entities
          ['^@dbs'],
          // App - Modules
          ['^@modules'],
          // App - Systems
          ['^@system'],
          // App - Utils
          ['^@utils'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
};
