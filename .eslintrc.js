module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "tsc"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "tsc/config": [
      1,
      {
        configFile: "tsconfig.json",
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.js", "test/**/*.ts", "test/**/*.js"],
    },
  ],
};
