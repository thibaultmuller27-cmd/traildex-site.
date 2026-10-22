/**
 * sRGB → CMYK through the printer's ICC profile (LittleCMS compiled to WASM),
 * so the print file is already in the press colour space and the dark card
 * backgrounds stay under the profile's ink limit.
 *
 * The profile itself is not shipped with the site (its licence does not allow
 * it): it is picked once in the print tool and kept in this browser.
 */
import {
  instantiate,
  cmsFLAGS_BLACKPOINTCOMPENSATION,
  cmsInfoDescription,
  INTENT_RELATIVE_COLORIMETRIC,
  TYPE_CMYK_8,
  TYPE_RGB_8,
} from "@/vendor/lcms-wasm/lcms.js"
import wasmUrl from "@/vendor/lcms-wasm/lcms.wasm?url"

export type CmykProfile = {
  /** Profile description, e.g. "ISO Coated v2 300% (ECI)". */
  name: string
  icc: Uint8Array
  /** Converts opaque RGBA pixels; maxInk is the highest C+M+Y+K found, in %. */
  convert(rgba: Uint8ClampedArray): { cmyk: Uint8Array; maxInk: number }
}

export async function loadCmykProfile(icc: Uint8Array): Promise<CmykProfile> {
  const lcms = await instantiate({ locateFile: () => wasmUrl })
  const out = lcms.cmsOpenProfileFromMem(icc, icc.byteLength)
  if (!out) throw new Error("Profil ICC illisible.")
  if (lcms.cmsGetColorSpaceASCII(out) !== "CMYK") throw new Error("Ce profil n'est pas un profil CMJN.")
  const name = lcms.cmsGetProfileInfoASCII(out, cmsInfoDescription, "en", "US").replace(/\0/g, "").trim()
  const srgb = lcms.cmsCreate_sRGBProfile()
  const transform = lcms.cmsCreateTransform(srgb, TYPE_RGB_8, out, TYPE_CMYK_8, INTENT_RELATIVE_COLORIMETRIC, cmsFLAGS_BLACKPOINTCOMPENSATION)
  if (!transform) throw new Error("Conversion impossible avec ce profil.")
  return {
    name,
    icc,
    convert(rgba) {
      const n = rgba.length / 4
      // lcms-wasm sizes its output from the input's extra channels, so feed it plain RGB.
      const rgb = new Uint8Array(n * 3)
      for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
        rgb[j] = rgba[i]
        rgb[j + 1] = rgba[i + 1]
        rgb[j + 2] = rgba[i + 2]
      }
      const cmyk = lcms.cmsDoTransform(transform, rgb, n)
      let max = 0
      for (let i = 0; i < cmyk.length; i += 4) {
        const t = cmyk[i] + cmyk[i + 1] + cmyk[i + 2] + cmyk[i + 3]
        if (t > max) max = t
      }
      return { cmyk, maxInk: Math.round((max / 255) * 100) }
    },
  }
}

// The chosen profile is kept in IndexedDB (too large for localStorage).
const DB = "traildex-print"
const STORE = "files"
const KEY = "cmyk-icc"

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

export async function saveProfileBytes(icc: Uint8Array) {
  const d = await db()
  await new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, "readwrite")
    tx.objectStore(STORE).put(icc, KEY)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export async function loadSavedProfileBytes(): Promise<Uint8Array | null> {
  try {
    const d = await db()
    return await new Promise((res) => {
      const r = d.transaction(STORE).objectStore(STORE).get(KEY)
      r.onsuccess = () => res((r.result as Uint8Array) ?? null)
      r.onerror = () => res(null)
    })
  } catch {
    return null
  }
}
