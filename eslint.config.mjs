// ESLint flat config for Darya project.
// Follows the Google JavaScript Style Guide
// (https://google.github.io/styleguide/jsguide.html).
//
// The application source is written as classic scripts (IIFE + global
// namespace attach) so the PWA works from file:// without a server, so
// the full Google-style rule set applies to **/*.js. Remaining .mjs
// files are the ESLint/Stylelint configs and the Node ESM test suite.
//
// This file is .mjs so ESLint parses it as ESM without requiring
// "type": "module" in package.json.

export default [
  {
    ignores: [
      'node_modules/',
      'assets/',
      'fonts/',
      'LICENSE.md',
      'capacitor.config.json'
    ]
  },
  // Application source: classic scripts (js/**/*.js) plus the service
  // worker (sw.js). Browser globals, the Darya runtime namespace, and
  // service worker globals are declared here.
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        Audio: 'readonly',
        HTMLAudioElement: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        matchMedia: 'readonly',
        MutationObserver: 'readonly',
        IntersectionObserver: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        globalThis: 'readonly',

        // Service worker (sw.js)
        self: 'readonly',
        caches: 'readonly',
        addEventListener: 'readonly',
        skipWaiting: 'readonly',
        clients: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Cache: 'readonly',
        CacheStorage: 'readonly',

        // Darya runtime namespace attached by the classic scripts
        DaryaUI: 'readonly',
        DaryaOverlays: 'readonly',
        DaryaAmbient: 'readonly',
        DaryaExporter: 'readonly',
        DaryaLogger: 'readonly',
        DaryaResponseEngine: 'readonly',
        DaryaUtils: 'readonly',
        DaryaHalfspace: 'readonly',
        DaryaEntityExtractor: 'readonly',
        DaryaKnowledge: 'readonly',
        DaryaTimeUtils: 'readonly',
        DaryaFactual: 'readonly',
        DaryaRecap: 'readonly',
        DaryaEn: 'readonly',
        DaryaFa: 'readonly',
        DaryaEnResponses: 'readonly',
        DaryaFaResponses: 'readonly',
        DaryaLang: 'readonly',
        DaryaAmbientSound: 'readonly'
      }
    },
    rules: {
      // --- Google JS Style Guide core rules ---

      // Variable rules: allow var for classic scripts that must load in
      // older browsers, but encourage modern where safe.
      'no-var': 'off',
      'prefer-const': 'warn',

      // No eval or dangerous patterns
      'no-eval': 'error',
      'no-new-wrappers': 'error',
      'no-implied-eval': 'warn',

      // Semicolons (required by Google style)
      semi: ['error', 'always'],

      // Quotes: single quotes preferred (Google style)
      quotes: ['error', 'single', { avoidEscape: true }],

      // Indentation: owned by Prettier. Prettier is the source of truth
      // for formatting (enforced by `format:check` in CI and the
      // pre-commit hook), and its ternary/member-expression indentation
      // differs from ESLint's `indent` rule at some nesting depths.
      // Keeping both rules active causes a permanent format/fix loop, so
      // the ESLint rule is disabled here, mirroring what
      // eslint-config-prettier does for this rule. All other spacing
      // rules below still apply.

      // Braces: always required (Google style)
      curly: ['error', 'all'],

      // Equality: === and !== required (Google style)
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // No trailing whitespace
      'no-trailing-spaces': 'error',

      // Comma dangle: none (Google style does not require trailing commas)
      'comma-dangle': ['error', 'never'],

      // Spacing rules (Google style)
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' }
      ],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      'block-spacing': ['error', 'always'],
      'func-call-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',

      // Line length: warn at 120 for this project (Google suggests 80)
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreComments: true
        }
      ],

      // No debug artifacts
      'no-debugger': 'error',
      'no-console': 'off', // Console is allowed for logging

      // Unused variables: warn for local vars
      'no-unused-vars': [
        'warn',
        { vars: 'local', args: 'none', caughtErrors: 'none' }
      ],

      // Best practices (Google style)
      'no-caller': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-floating-decimal': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'warn',
      'no-multi-str': 'error',
      'no-new': 'warn',
      'no-octal': 'error',
      'no-proto': 'error',
      'no-redeclare': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ],
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-void': 'error',
      'no-with': 'error',
      radix: 'error',
      yoda: 'error'

      // Strict mode: disabled because this is a static PWA with no file
      // concatenation. Every file already has file-level 'use strict'.
      // strict: ['error', 'function'], // Google style recommends function-level
    }
  },
  // Config files that remain ESM (eslint.config.mjs, .stylelintrc.mjs)
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-var': 'off',
      'prefer-const': 'warn',
      'max-len': 'off'
    }
  },
  // Test files (ESM .mjs): allow Node.js import/export
  {
    files: ['tests/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals (CommonJS + test runner)
        global: 'readonly', // Node.js global object
        require: 'readonly', // CommonJS require
        module: 'readonly', // CommonJS module
        __dirname: 'readonly', // Node.js dirname
        __filename: 'readonly', // Node.js filename
        exports: 'readonly', // CommonJS exports
        process: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-unused-expressions': 'off', // assert.throws() needs expressions
      'max-len': 'off'
    }
  }
];
