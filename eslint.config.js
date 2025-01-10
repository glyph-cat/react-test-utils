/* eslint-disable @typescript-eslint/no-require-imports */
const { Severity } = require('@glyph-cat/eslint-config')
const { libraryAuthoring: baseLibraryAuthoring } = require('@glyph-cat/eslint-config/base')
const {
  BuildRule,
  EXHAUSTIVE_DEPS_DEFAULT_ADDITIONAL_HOOKS,
  libraryAuthoring: reactLibraryAuthoring,
} = require('@glyph-cat/eslint-config/react')
const { recommended: jestRecommended } = require('@glyph-cat/eslint-config/jest')

// TODO: 'eslint-plugin-functional'?

module.exports = [
  ...baseLibraryAuthoring,
  ...jestRecommended,
  ...reactLibraryAuthoring,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': Severity.OFF,
      ...BuildRule.ReactHooks.ExhaustiveDeps(Severity.WARN, [
        ...EXHAUSTIVE_DEPS_DEFAULT_ADDITIONAL_HOOKS,
      ]),
    },
  },
  {
    ignores: [
      '*/eslint.config.js',
      'config/rollup.config.js',
    ],
  },
]
