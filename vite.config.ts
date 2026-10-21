import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    rollupOptions: {
      input: { main: path.resolve(__dirname, "index.html"), print: path.resolve(__dirname, "print.html") },
    },
  },
})
