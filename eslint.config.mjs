import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Next.js 16 ships native flat configs — use them directly (FlatCompat breaks
// on the react plugin's circular config under ESLint 9/10).
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: ["tmp/**", "docs/**", "supabase/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
