import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Only the public site is built here. The print tool (print.html) stays
// private: it runs with `npm run dev` and is packaged by `npm run build:outil`.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
})
