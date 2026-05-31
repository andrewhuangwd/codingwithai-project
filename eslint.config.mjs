import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "dist/**"],
  },
  ...nextConfig,
  ...tseslint.configs.recommended,
);
