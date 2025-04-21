// Minimal ESLint flat config that ignores all TypeScript and Vue files
export default [
  {
    ignores: [
      "**/*.ts",
      "**/*.vue",
      "**/*.d.ts",
      "**/.nuxt/**/*"
    ]
  },
  {
    // Only lint JavaScript files
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  }
];