export type DnfDrawData = {
  discipline: "trail" | "run" | "bike"
  title1: string
  title2: string
  dateLine: string
  kmLine: string
  stats: [string, string][]
  route: [number, number][]
  ele: number[]
  runner: string
  number: string
  year: string
  qr?: number[][]
}
export function drawDnfCard(canvas: HTMLCanvasElement, data: DnfDrawData, side?: "front" | "back"): void
