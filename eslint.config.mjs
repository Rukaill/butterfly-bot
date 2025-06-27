export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // 明示的に require を使うならこちらは不要
      },
      env: {
        node: true, // 👈 Node.js のグローバル（requireなど）を有効にする
      },
    },
    rules: {
      // 必要に応じて追加
    },
  },
];
