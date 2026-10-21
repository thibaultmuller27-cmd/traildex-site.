/** Re-encodes a photo (data URL) smaller, in the browser. */
export function shrinkPhoto(src: string, max: number, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement("canvas")
      c.width = Math.round(img.width * s)
      c.height = Math.round(img.height * s)
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL("image/jpeg", quality))
    }
    img.onerror = reject
    img.src = src
  })
}
