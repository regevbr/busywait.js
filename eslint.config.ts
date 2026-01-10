import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'build/**', '*.config.js']
  },
  {
    // 1. JavaScript files
    files: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.mjs', 'src/**/*.cjs'],
    
    // 2. Setup plugins
    plugins: {
      '@stylistic': stylistic
    },

    // 3. Language options
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2015
      },
      sourceType: 'commonjs',
      ecmaVersion: 2015
    },

    // 4. Rules
    rules: {
      /**
       * Strict mode
       */
      'strict': [2, 'global'],

      /**
       * ES6
       */
      'no-var': 2,

      /**
       * Variables
       */
      'no-shadow': 2,
      'no-shadow-restricted-names': 2,
      'no-unused-vars': [2, {
        'vars': 'local',
        'args': 'after-used'
      }],
      'no-use-before-define': 2,

      /**
       * Possible errors
       */
      'no-cond-assign': [2, 'always'],
      'no-console': 1,
      'no-debugger': 1,
      'no-alert': 1,
      'no-constant-condition': 1,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-empty': 2,
      'no-ex-assign': 2,
      'no-extra-boolean-cast': 0,
      'no-extra-semi': 2,
      'no-func-assign': 2,
      'no-inner-declarations': 2,
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-obj-calls': 2,
      'no-sparse-arrays': 2,
      'no-unreachable': 2,
      'use-isnan': 2,
      'block-scoped-var': 2,

      /**
       * Best practices
       */
      'consistent-return': 2,
      'curly': [2, 'multi-line'],
      'default-case': 2,
      'dot-notation': [2, {
        'allowKeywords': true
      }],
      'eqeqeq': 2,
      'guard-for-in': 2,
      'no-caller': 2,
      'no-else-return': 2,
      'no-eq-null': 2,
      'no-eval': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-fallthrough': 2,
      'no-implied-eval': 2,
      'no-lone-blocks': 2,
      'no-loop-func': 2,
      'no-multi-str': 2,
      'no-global-assign': 2,
      'no-new': 2,
      'no-new-func': 2,
      'no-new-wrappers': 2,
      'no-octal': 2,
      'no-octal-escape': 2,
      'no-param-reassign': 0,
      'no-proto': 2,
      'no-redeclare': 2,
      'no-return-assign': 2,
      'no-script-url': 2,
      'no-self-compare': 2,
      'no-sequences': 2,
      'no-throw-literal': 2,
      'no-with': 2,
      'radix': 2,
      'vars-on-top': 2,
      'yoda': 2,

      /**
       * Stylistic Rules
       */
      '@stylistic/comma-dangle': [2, 'never'],
      '@stylistic/no-floating-decimal': 2,
      '@stylistic/wrap-iife': [2, 'any'],
      '@stylistic/indent': [2, 2],
      '@stylistic/brace-style': [2, '1tbs', {
        'allowSingleLine': true
      }],
      '@stylistic/quotes': [2, 'single', { 
        'avoidEscape': true 
      }],
      'camelcase': [2, {
        'properties': 'never'
      }],
      '@stylistic/comma-spacing': [2, {
        'before': false,
        'after': true
      }],
      '@stylistic/comma-style': [2, 'last'],
      '@stylistic/eol-last': 2,
      'func-names': 0,
      '@stylistic/key-spacing': [2, {
        'beforeColon': false,
        'afterColon': true
      }],
      '@stylistic/new-cap': [2, {
        'newIsCap': true
      }],
      '@stylistic/no-multiple-empty-lines': [2, {
        'max': 2
      }],
      'no-nested-ternary': 2,
      'no-new-object': 2,
      '@stylistic/no-trailing-spaces': 2,
      '@stylistic/no-extra-parens': 2,
      'no-underscore-dangle': 0,
      '@stylistic/padded-blocks': [2, 'never'],
      '@stylistic/semi': [2, 'never'],
      '@stylistic/keyword-spacing': 2,
      '@stylistic/space-before-blocks': 2,
      '@stylistic/space-before-function-paren': [2, 'never'],
      '@stylistic/space-infix-ops': 2,
      '@stylistic/spaced-comment': 2
    }
  },
  {
    // 1. TypeScript files
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    
    // 2. Setup plugins
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint
    },

    // 3. Language options
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2015
      },
      sourceType: 'commonjs',
      ecmaVersion: 2015,
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },

    // 4. Rules (same as JS, but with TypeScript-specific overrides)
    rules: {
      /**
       * Strict mode
       */
      'strict': [2, 'global'],

      /**
       * ES6
       */
      'no-var': 2,

      /**
       * Variables - disable base rules in favor of TypeScript equivalents
       */
      'no-shadow': 0,
      '@typescript-eslint/no-shadow': 2,
      'no-shadow-restricted-names': 2,
      'no-unused-vars': 0,
      '@typescript-eslint/no-unused-vars': [2, {
        'vars': 'local',
        'args': 'after-used'
      }],
      'no-use-before-define': 0,
      '@typescript-eslint/no-use-before-define': 2,

      /**
       * Possible errors
       */
      'no-cond-assign': [2, 'always'],
      'no-console': 1,
      'no-debugger': 1,
      'no-alert': 1,
      'no-constant-condition': 1,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-empty': 2,
      'no-ex-assign': 2,
      'no-extra-boolean-cast': 0,
      'no-extra-semi': 0,
      'no-func-assign': 2,
      'no-inner-declarations': 2,
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-obj-calls': 2,
      'no-sparse-arrays': 2,
      'no-unreachable': 2,
      'use-isnan': 2,
      'block-scoped-var': 2,

      /**
       * Best practices
       */
      'consistent-return': 2,
      'curly': [2, 'multi-line'],
      'default-case': 2,
      'dot-notation': [2, {
        'allowKeywords': true
      }],
      'eqeqeq': 2,
      'guard-for-in': 2,
      'no-caller': 2,
      'no-else-return': 2,
      'no-eq-null': 2,
      'no-eval': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-fallthrough': 2,
      'no-implied-eval': 2,
      'no-lone-blocks': 2,
      'no-loop-func': 2,
      'no-multi-str': 2,
      'no-global-assign': 2,
      'no-new': 2,
      'no-new-func': 2,
      'no-new-wrappers': 2,
      'no-octal': 2,
      'no-octal-escape': 2,
      'no-param-reassign': 0,
      'no-proto': 2,
      'no-redeclare': 0,
      '@typescript-eslint/no-redeclare': 2,
      'no-return-assign': 2,
      'no-script-url': 2,
      'no-self-compare': 2,
      'no-sequences': 2,
      'no-throw-literal': 2,
      'no-with': 2,
      'radix': 2,
      'vars-on-top': 2,
      'yoda': 2,

      /**
       * Stylistic Rules
       */
      '@stylistic/comma-dangle': [2, 'never'],
      '@stylistic/no-floating-decimal': 2,
      '@stylistic/wrap-iife': [2, 'any'],
      '@stylistic/indent': [2, 2],
      '@stylistic/brace-style': [2, '1tbs', {
        'allowSingleLine': true
      }],
      '@stylistic/quotes': [2, 'single', { 
        'avoidEscape': true 
      }],
      'camelcase': [2, {
        'properties': 'never'
      }],
      '@stylistic/comma-spacing': [2, {
        'before': false,
        'after': true
      }],
      '@stylistic/comma-style': [2, 'last'],
      '@stylistic/eol-last': 2,
      'func-names': 0,
      '@stylistic/key-spacing': [2, {
        'beforeColon': false,
        'afterColon': true
      }],
      '@stylistic/no-multiple-empty-lines': [2, {
        'max': 2
      }],
      'no-nested-ternary': 2,
      'no-new-object': 2,
      '@stylistic/no-trailing-spaces': 2,
      '@stylistic/no-extra-parens': 2,
      'no-underscore-dangle': 0,
      '@stylistic/padded-blocks': [2, 'never'],
      '@stylistic/semi': [2, 'never'],
      '@stylistic/keyword-spacing': 2,
      '@stylistic/space-before-blocks': 2,
      '@stylistic/space-before-function-paren': [2, 'never'],
      '@stylistic/space-infix-ops': 2,
      '@stylistic/spaced-comment': 2
    }
  }
];
