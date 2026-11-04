/** "Relive the race": the route draws itself on the card from start to finish. */

export const REPLAY_MS = 5000

/** Points of the profile line ("M x y L x y…", x 0–100, y 0–30 with 0 = highest). */
export function profilePoints(profileLine?: string): [number, number][] {
  if (!profileLine) return []
  const nums = profileLine.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const pts: [number, number][] = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]])
  return pts
}

/** Profile height (0–30, 0 = top) at x (0–100), by linear interpolation. */
export function profileY(pts: [number, number][], x: number) {
  if (!pts.length) return 30
  if (x <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    if (x <= x1) {
      const [x0, y0] = pts[i - 1]
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return pts[pts.length - 1][1]
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
