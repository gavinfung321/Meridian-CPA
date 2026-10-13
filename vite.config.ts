import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vercel: "/". GitHub Pages project site: "/Meridian-CPA/".
const base = process.env.VITE_BASE_PATH ?? "/";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
});
