import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
    {
        ignores: ["build/**", "dist/**", "node_modules/**"]
    },
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                ecmaFeatures: { jsx: true }
            }
        }
    },
    pluginJs.configs.recommended,
    {
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": pluginJsxA11y,
        },
        settings: {
            react: { version: "detect" },
        },
        rules: {
            // React Recommended (manually verifying key ones + user overrides)
            ...pluginReact.configs.recommended.rules,

            // User Overrides from previous .eslintrc.js
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "warn",
            "react/jsx-uses-react": "off",
            "react/jsx-uses-vars": "error",

            // React Hooks
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // Accessibility (Explicitly re-adding from previous config)
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-proptypes": "error",
            "jsx-a11y/aria-unsupported-elements": "error",
            "jsx-a11y/role-has-required-aria-props": "error",
            "jsx-a11y/role-supports-aria-props": "error",
            "jsx-a11y/click-events-have-key-events": "error",
            "jsx-a11y/no-static-element-interactions": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "jsx-a11y/heading-has-content": "error",
            "jsx-a11y/label-has-associated-control": "error",

            // General Rules
            "no-unused-vars": "warn",
            "no-console": "warn",
            "no-debugger": "error",
            "prefer-const": "error",
            "no-var": "error"
        }
    }
];
