/**
 * Builds a private preview of the public site as one HTML file (outil/dnf-cards-apercu-site.html),
 * (outil/traildex-outil-impression.html), to publish on claude.ai.
 * It is never part of the public site (see vite.config.ts).
 */
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { build } from "vite"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const tmp = path.join(root, "outil", ".build-site")

await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: [react()],
  resolve: { alias: { "@": path.join(root, "src") } },
  build: {
    outDir: tmp,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rollupOptions: { input: path.join(root, "index.html"), output: { inlineDynamicImports: true } },
  },
})

const assets = path.join(tmp, "assets")
const file = (ext) => readFileSync(path.join(assets, readdirSync(assets).find((f) => f.endsWith(ext))), "utf8")
// Inline JS: keep "</script" out of the code and escape U+FFFD (charset tables).
const js = file(".js").replace(/<\/script/gi, "<\\/script").replace(/�/g, "\\uFFFD")
const css = file(".css")
const head = readFileSync(path.join(root, "index.html"), "utf8").match(/<link[^>]+fonts[^>]+>/g)?.join("\n") ?? ""

const html = `<title>DNF Cards — aperçu</title>
<meta name="robots" content="noindex" />
${head}
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(path.join(root, "outil", "dnf-cards-apercu-site.html"), html)
rmSync(tmp, { recursive: true, force: true })
console.log(`outil/dnf-cards-apercu-site.html (${(html.length / 1e6).toFixed(1)} Mo)`)
