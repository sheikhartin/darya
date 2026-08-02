// Stylelint config for Darya project.
// Follows the Google HTML/CSS Style Guide
// (https://google.github.io/styleguide/htmlcssguide.html).
// Uses stylelint-config-standard as the base with Google-specific
// rule overrides. This file is .mjs for ESM compat without
// requiring "type": "module" in package.json.

export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // --- Google HTML/CSS Style Guide rules ---

    // Selectors: lowercase class names with hyphens (Google style).
    // Supports BEM-like naming: block__element--modifier
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      {
        message: 'Expected class selector to be BEM-like lowercase with hyphens'
      }
    ],

    // Selectors: avoid ID selectors (Google style recommends classes).
    // Allow occasional ID usage (max 1) for critical component anchors.
    'selector-max-id': 1,

    // Selectors: no type qualifiers on class/ID selectors
    // (e.g. ul.example -> .example, div#foo -> #foo).
    // Disabled because the project uses html:not(.no-theme-transition)
    // for theme transition scoping, which is a structural state selector,
    // not a class qualifier. Accept this intentional pattern.
    'selector-no-qualifying-type': null,

    // Disallow decreasing specificity: normally selectors should be
    // ordered from least to most specific. However, the theme
    // transition pattern (html:not(.no-theme-transition)) and beach
    // overrides intentionally place higher-specificity selectors
    // after lower-specificity ones. Disabled to accept this pattern.
    'no-descending-specificity': null,

    // Color: shorthand where possible (#abc vs #aabbcc)
    'color-hex-length': 'short',

    // Zero values: omit unit (e.g. margin: 0 not margin: 0px)
    'length-zero-no-unit': true,

    // Font family: quote only when necessary (single-word names unquoted)
    // See https://google.github.io/styleguide/htmlcssguide.html#font_Face
    'font-family-name-quotes': 'always-where-recommended',

    // Shorthand: use shorthand where possible (Google style)
    'shorthand-property-no-redundant-values': true,

    // Declaration blocks: no empty blocks (Google style)
    'block-no-empty': true,

    // Comments: no empty comments (Google style)
    'comment-no-empty': true,

    // Disallow vendor prefixes for standard properties in modern browsers
    'property-no-vendor-prefix': true,
    'selector-no-vendor-prefix': true,
    'media-feature-name-no-vendor-prefix': true,
    'at-rule-no-vendor-prefix': true,

    // Disallow duplicate selectors: disabled because the CSS uses
    // repeated selectors across different sections to define different
    // property groups for the same selector (e.g. beach theme
    // overrides at the bottom define their own custom properties).
    // This is an intentional CSS pattern, not a bug.
    'no-duplicate-selectors': null,

    // Disallow duplicate at-import rules
    'no-duplicate-at-import-rules': true,

    // Disallow unknown at-rules (allow CSS standard and common frameworks)
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'variants',
          'responsive',
          'screen'
        ]
      }
    ],

    // Disallow unknown CSS properties
    'declaration-property-value-no-unknown': true,

    // Allow modern color function notation (Google style prefers
    // the legacy rgba() format for readability, but modern rgb()
    // with percentage alpha is also acceptable)
    'color-function-notation': 'legacy',

    // Allow rgba() alias notation (Google style uses rgba consistently)
    'color-function-alias-notation': 'with-alpha',

    // Alpha values: allow decimal notation (rgba(0, 0, 0, 0.5))
    'alpha-value-notation': 'number',

    // Comments: don't require blank lines before all comments
    // (they are used extensively as section dividers)
    'comment-empty-line-before': null
  }
};
