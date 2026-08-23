// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // This app is NgModule-based on purpose: every declaration carries `standalone: false`.
      // Beyond being wrong for us, `--fix` on this rule strips that property, which silently
      // makes components standalone while they are still declared in a module.
      "@angular-eslint/prefer-standalone": "off",
      // ~110 sites in code that predates strict typing. Turning this on would drown the
      // signal from every other rule; revisit if the models ever get typed properly.
      "@typescript-eslint/no-explicit-any": "off",
      // Unused *parameters* are usually interface obligations (ControlValueAccessor's
      // registerOnChange(fn), setDisabledState(isDisabled)); unused variables and imports
      // are still real dead code and stay errors.
      "@typescript-eslint/no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      // `onSuccess && onSuccess()` is used throughout for optional callbacks.
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],
      // Empty methods are usually ControlValueAccessor no-ops that the interface requires.
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors", "methods"] }],
      // Stylistic; the codebase consistently uses getters for constants.
      "@typescript-eslint/class-literal-property-style": "off",
      // `@Input('extra-params')` and friends are the public template API; renaming them
      // would be a breaking change to every template that uses these directives.
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/no-output-on-prefix": "warn",
      // Bare @ts-ignore comments predate this config; visible, but not blocking.
      "@typescript-eslint/ban-ts-comment": "warn",
      // Renaming these outputs changes the template API; worth doing, not silently.
      "@angular-eslint/no-output-native": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "otp",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "otp",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Real accessibility gaps, but fixing them is a design change per form; keep them
      // visible as warnings rather than blocking CI on work nobody has scheduled.
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
    },
  }
);
