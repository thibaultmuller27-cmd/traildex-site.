// Minimal types for the parts of lcms-wasm 1.0.5 (LittleCMS, MIT) that TrailDex uses.
export type Lcms = {
  cmsOpenProfileFromMem(data: Uint8Array, size: number): number
  cmsCreate_sRGBProfile(): number
  cmsCloseProfile(profile: number): void
  cmsGetProfileInfoASCII(profile: number, info: number, lang: string, country: string): string
  cmsGetColorSpaceASCII(profile: number): string | null
  cmsCreateTransform(input: number, inFormat: number, output: number, outFormat: number, intent: number, flags: number): number
  cmsDeleteTransform(transform: number): void
  cmsDoTransform(transform: number, input: Uint8Array, pixels: number): Uint8Array
}
export function instantiate(opts?: { locateFile?: (name: string) => string }): Promise<Lcms>
export const TYPE_RGB_8: number
export const TYPE_CMYK_8: number
export const INTENT_RELATIVE_COLORIMETRIC: number
export const cmsFLAGS_BLACKPOINTCOMPENSATION: number
export const cmsInfoDescription: number
