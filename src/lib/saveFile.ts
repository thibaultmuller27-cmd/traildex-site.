/**
 * Offers a generated file to the user. On the site it is a plain browser
 * download; when the tool runs as a published claude.ai page, downloads go
 * through the viewer's "downloads" capability (the viewer confirms each file).
 */
type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<unknown> }
type ClaudeHost = { use: (name: "downloads") => Promise<Downloads | null> }

export async function saveFile(data: Uint8Array | Blob, filename: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const host = (window as unknown as { claude?: ClaudeHost }).claude
  const downloads = host?.use ? await host.use("downloads") : null
  if (downloads) {
    await downloads.save({ filename, data: blob })
    return
  }
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
