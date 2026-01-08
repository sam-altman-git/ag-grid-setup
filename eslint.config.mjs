// eslint.config.js
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    ignores: ["public/*", "components/workflow/Layout/re10launcher.js"],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 1,
    },
    // files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,
      "no-prototype-builtins": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-console": ["error", { allow: ["warn", "error", "log"] }],
      "react-hooks/exhaustive-deps": "off",
      // typescript will handle no-unused-vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          // args: "all",
          argsIgnorePattern: "^_",
          // caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          // ignoreRestSiblings: true,
        },
      ],
      // semi: ["error", "always"],
      "@typescript-eslint/semi": ["error", "always"],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "comma-dangle": ["error", "always-multiline"],
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "always"],
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-before-blocks": ["error", "always"],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "space-unary-ops": ["error", { words: true, nonwords: false }],
      "space-before-function-paren": ["error", "never"],
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-duplicate-imports": "error",
      "arrow-spacing": ["error", { before: true, after: true }],
      "arrow-parens": ["error", "always"],
      "jsx-quotes": ["error", "prefer-double"],
      quotes: ["error", "double", { avoidEscape: true }],
      "quote-props": ["error", "as-needed"],
      "no-undef": "error",
      "no-extra-semi": "error",
      "no-duplicate-case": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-fallthrough": "error",
      "no-irregular-whitespace": "error",
      "no-mixed-spaces-and-tabs": "error",
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
      "prefer-arrow-callback": "error",
      eqeqeq: "error",
      "no-var": "error",
      indent: ["error", 2, { SwitchCase: 1 }],
      "no-alert": "error",
      "no-eval": "error",
      // Add stylelint rules
      // "stylelint/color-no-invalid-hex": "error",
      // "stylelint/declaration-block-no-duplicate-properties": "error",
      // "stylelint/block-no-empty": "error",
      // "stylelint/no-extra-semicolons": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettierConfig,
]);
