module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module",
    "project": "./tsconfig.json",
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true,
  },
  "rules": {
    "no-unused-vars": "off",
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "semi": true,
        "trailingComma": "es5",
        "printWidth": 160,
        "arrowParens": "always",
      },
    ],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
      },
    ],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
  },
}
