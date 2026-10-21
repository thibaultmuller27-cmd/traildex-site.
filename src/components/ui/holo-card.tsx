import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * HoloCard — adapted from the 21st.dev "Holo Card" by @kedhareswer
 * (https://21st.dev/@kedhareswer/components/holo-card).
 *
 * Kept from the original: the view-vector maths, the diffraction-grating foil
 * shader whose phase follows the viewing direction (hold the card still and
 * the rainbow holds still), the spring-chased tilt and the idle drift.
 *
 * Changed for TrailDex: the faces are free React content (route, profile,
 * stats…), the foil is a blended layer above them, the flip has its own
 * eased transition, the loop writes transforms straight to the DOM instead
 * of re-rendering React every frame, WebGL only runs while the card is on
 * screen (browsers cap the number of live contexts), and there is an optional
 * continuous spin for the hero.
 */

export type FoilFinish = "pearl" | "silver" | "gold"

export type HoloCardProps = {
  front: React.ReactNode
  back: React.ReactNode
  /** Foil film over the front face. `null` = matte card (glare only). */
  finish?: FoilFinish | null
  /** Opacity of the foil layer, 0–1. */
  foilOpacity?: number
  /** Card width. Height follows the 5:7 trading-card ratio. */
  width?: string
  /** Largest tilt in degrees. */
  tilt?: number
  /** Drift when nobody is touching it, so it catches the light on its own. */
  idle?: boolean
  /** Continuous slow turn around the vertical axis (hero). */
  spin?: boolean
  flippable?: boolean
  /** Use the WebGL foil. Falls back to a CSS foil when false or unavailable. */
  webgl?: boolean
  label?: string
  className?: string
  /** Border radius of the card, as a share of its width. */
  radius?: string
}

// #region maths (from the original component)
const clampTilt = (v: number, max: number) => (v > max ? max : v < -max ? -max : v)

const tiltFromPointer = (x: number, y: number, max: number) => ({
  ax: clampTilt((0.5 - y) * 2 * max, max),
  ay: clampTilt((x - 0.5) * 2 * max, max),
})

const viewFromTilt = (ax: number, ay: number): [number, number, number] => {
  const rx = (ax * Math.PI) / 180
  const ry = (ay * Math.PI) / 180
  const x = Math.sin(ry) * Math.cos(rx)
  const y = -Math.sin(rx)
  const z = Math.cos(ry) * Math.cos(rx)
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}
// #endregion

const FINISH_ID: Record<FoilFinish, number> = { pearl: 0, silver: 1, gold: 3 }

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2) * 2.0 - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
}
`

// The original fragment shader, without the art/backdrop textures: the
// generated guilloche face plus the view-dependent foil. It is composited
// over the card face with `mix-blend-mode: screen`, so its near-black base
// disappears and only the rays, rings, sweep and glitter remain.
const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform vec3 uView;
uniform float uTime;
uniform float uFinish;
uniform float uPattern;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 spectrum(float phase) {
  return 0.66 + 0.25 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
}

float grating(vec2 uv) {
  vec2 p = (uv - vec2(0.5, 0.46)) * vec2(uRes.x / uRes.y, 1.0);
  return atan(p.y, p.x) * 3.0 + length(p) * 6.0;
}

vec3 film(vec2 uv) {
  float phase = uv.x * 0.85 + uv.y * 0.55 + uView.x * 1.5 - uView.y * 0.9
    + grating(uv) * uPattern;
  if (uFinish > 2.5) {
    float hi = 0.5 + 0.5 * sin(phase * 6.28318);
    float glint = 0.5 + 0.5 * cos((phase + 0.25) * 6.28318);
    return mix(vec3(0.72, 0.50, 0.20), vec3(1.00, 0.90, 0.60), hi * 0.7 + glint * 0.3);
  }
  vec3 color = spectrum(phase);
  return mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), step(0.5, uFinish));
}

float sweep(vec2 uv) {
  return pow(0.5 + 0.5 * sin((uv.x * 0.72 + uv.y * 0.45 + uView.x * 1.2 + uView.y * 0.6) * 6.283), 10.0);
}

vec3 generated(vec2 uv) {
  vec2 p = (uv - vec2(0.5, 0.46)) * vec2(uRes.x / uRes.y, 1.0) * 2.1;
  float r = length(p);
  float a = atan(p.y, p.x);
  vec3 col = mix(vec3(0.045, 0.035, 0.075), vec3(0.015, 0.012, 0.03), smoothstep(0.1, 1.4, r));
  float rays = pow(0.5 + 0.5 * cos(a * 72.0), 8.0);
  col += vec3(0.55, 0.60, 0.80) * rays * smoothstep(1.45, 0.12, r) * 0.42;
  float rings = pow(0.5 + 0.5 * cos(r * 90.0), 8.0);
  col += vec3(0.45, 0.55, 0.85) * rings * smoothstep(1.5, 0.1, r) * 0.30;
  return col;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  vec3 col = generated(uv + uView.xy / max(abs(uView.z), 0.4) * -0.02);

  vec3 foil = film(uv);
  float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float band = sweep(uv);
  float goldBoost = uFinish > 2.5 ? 1.7 : 1.0;

  col *= 1.0 - 0.21 * (1.0 - foil) * (0.2 + band * 0.8);
  col += foil * band * goldBoost * (0.065 + 0.11 * (1.0 - luminance)) * 1.7;
  col += foil * foil * (0.04 + 2.4 * luminance);

  float edge = 1.0 - smoothstep(0.015, 0.06, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  col = mix(col, foil * 0.75 + 0.21, edge * (uFinish > 2.5 ? 0.42 : 0.3));

  vec2 cell = floor(uv * vec2(480.0, 720.0));
  float flake = step(0.994, hash(cell)) *
    pow(0.5 + 0.5 * sin(hash(cell + 8.0) * 30.0 + uView.x * 20.0 + uTime * 0.6), 10.0);
  col += foil * flake * 0.13;

  // Screen-blended over printed content: keep the guilloche faint and let
  // it flare where the light band crosses, so the type stays legible.
  col *= 0.38 + 0.9 * band + edge * 0.4;

  fragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 1.6)), 1.0);
}
`

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)
  if (!sh) throw new Error("no shader")
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error("shader: " + log)
  }
  return sh
}

type Renderer = { draw: (view: [number, number, number], time: number) => void; dispose: () => void }

// Browsers keep ~16 live WebGL contexts and silently kill the oldest beyond
// that. Cards past this budget use the CSS foil instead.
const MAX_CONTEXTS = 10
let liveContexts = 0

function createRenderer(canvas: HTMLCanvasElement, finish: FoilFinish): Renderer | null {
  if (liveContexts >= MAX_CONTEXTS) return null
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" })
  if (!gl) return null
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!program) throw new Error("no program")
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link")
    const vao = gl.createVertexArray()
    const u = Object.fromEntries(
      ["uRes", "uView", "uTime", "uFinish", "uPattern"].map((k) => [k, gl.getUniformLocation(program, k)]),
    )
    liveContexts++
    let disposed = false
    return {
      draw(view, time) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.round(canvas.clientWidth * dpr)
        const h = Math.round(canvas.clientHeight * dpr)
        if (!w || !h) return
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
          gl.viewport(0, 0, w, h)
        }
        gl.useProgram(program)
        gl.bindVertexArray(vao)
        gl.uniform2f(u.uRes, w, h)
        gl.uniform3f(u.uView, view[0], view[1], view[2])
        gl.uniform1f(u.uTime, time)
        gl.uniform1f(u.uFinish, FINISH_ID[finish])
        gl.uniform1f(u.uPattern, 0.22)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      },
      dispose() {
        if (disposed) return
        disposed = true
        liveContexts--
        gl.deleteVertexArray(vao)
        gl.deleteProgram(program)
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      },
    }
  } catch {
    return null
  }
}

export const CSS_FOIL: Record<FoilFinish, string> = {
  pearl:
    "repeating-linear-gradient(115deg,#ff8ad8 0%,#ffd36e 6%,#8cff9e 12%,#6ee7ff 18%,#9a8cff 24%,#ff8ad8 30%)",
  silver: "repeating-linear-gradient(115deg,#9aa4b5 0%,#ffffff 8%,#7c8799 16%,#e9eef6 24%,#9aa4b5 32%)",
  gold: "repeating-linear-gradient(115deg,#a86b1f 0%,#ffe29a 8%,#b77a2a 16%,#fff1c4 24%,#a86b1f 32%)",
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return reduced
}

export function HoloCard({
  front,
  back,
  finish = "pearl",
  foilOpacity = 0.7,
  width = "clamp(230px, 64vw, 340px)",
  tilt = 16,
  idle = true,
  spin = false,
  flippable = true,
  webgl = true,
  label,
  className,
  radius = "4.5%",
}: HoloCardProps) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const tiltRef = React.useRef<HTMLDivElement | null>(null)
  const shadowRef = React.useRef<HTMLDivElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const renderer = React.useRef<Renderer | null>(null)
  const target = React.useRef({ ax: 0, ay: 0, active: false })
  const down = React.useRef<{ x: number; y: number } | null>(null)
  const dragged = React.useRef(false)
  const [flipped, setFlipped] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [gpuFoil, setGpuFoil] = React.useState(false)
  const reduced = useReducedMotion()

  const tuning = React.useRef({ tilt, idle, spin, reduced, flipped })
  tuning.current = { tilt, idle, spin, reduced, flipped }

  // Only cards on (or near) screen animate and hold a GPU context.
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (!visible || !finish || !webgl || !canvasRef.current) return
    const r = createRenderer(canvasRef.current, finish)
    renderer.current = r
    setGpuFoil(!!r)
    return () => {
      r?.dispose()
      renderer.current = null
    }
  }, [visible, finish, webgl])

  React.useEffect(() => {
    if (!visible) return
    let raf = 0
    let ax = 0
    let ay = 0
    let spinAngle = 0
    let last = performance.now()
    const started = last

    const frame = () => {
      const t = tuning.current
      const nowMs = performance.now()
      const dt = Math.min(0.05, (nowMs - last) / 1000)
      last = nowMs
      const now = (nowMs - started) / 1000
      const active = target.current.active

      let driftX = 0
      let driftY = 0
      if (t.idle && !t.reduced && !active) {
        // Two frequencies that share no multiple, or it visibly loops.
        driftX = Math.sin(now * 0.41) * t.tilt * 0.34
        driftY = Math.cos(now * 0.27) * t.tilt * 0.46
      }

      if (t.spin && !t.reduced) {
        if (active || t.flipped) {
          // Settle on the nearest full turn so the front faces the viewer.
          const goal = Math.round(spinAngle / 360) * 360
          spinAngle += (goal - spinAngle) * 0.08
        } else {
          spinAngle += dt * 26
        }
      }

      const k = t.reduced ? 1 : 0.12
      ax += ((active ? target.current.ax : 0) + driftX - ax) * k
      ay += ((active ? target.current.ay : 0) + driftY - ay) * k

      const totalY = ay + spinAngle
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateX(${ax.toFixed(2)}deg) rotateY(${totalY.toFixed(2)}deg)`
      }
      const root = rootRef.current
      if (root) {
        // Glare follows the light, i.e. the opposite of the tilt.
        const gx = 50 + (ay / t.tilt) * 40
        const gy = 50 - (ax / t.tilt) * 40
        root.style.setProperty("--gx", gx.toFixed(1) + "%")
        root.style.setProperty("--gy", gy.toFixed(1) + "%")
        root.style.setProperty("--shine", Math.min(1, 0.35 + Math.hypot(ax, ay) / t.tilt).toFixed(2))
      }
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translateX(${(-ay * 0.9).toFixed(1)}px) scaleX(${(1 - Math.abs(Math.sin((totalY * Math.PI) / 180)) * 0.55).toFixed(3)})`
      }
      renderer.current?.draw(viewFromTilt(ax, totalY), t.reduced ? 0 : now)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  const onPointerMove = (e: React.PointerEvent) => {
    const el = rootRef.current
    if (!el) return
    if (down.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) {
      dragged.current = true
    }
    if (e.pointerType !== "mouse" && !down.current) return
    const r = el.getBoundingClientRect()
    const { ax, ay } = tiltFromPointer(
      (e.clientX - r.left) / Math.max(r.width, 1),
      (e.clientY - r.top) / Math.max(r.height, 1),
      tuning.current.tilt,
    )
    target.current = { ax, ay, active: true }
  }
  const release = () => {
    down.current = null
    target.current = { ax: 0, ay: 0, active: false }
  }
  const toggle = () => flippable && setFlipped((f) => !f)

  const faceStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: radius,
    containerType: "inline-size",
    isolation: "isolate",
  }

  return (
    <div ref={wrapRef} className={cn("relative select-none", className)} style={{ width, perspective: "1100px" }}>
      <div
        ref={rootRef}
        role={flippable ? "button" : undefined}
        tabIndex={flippable ? 0 : undefined}
        aria-label={label ? (flippable ? `${label} — ${flipped ? "voir le recto" : "voir le verso"}` : label) : undefined}
        aria-pressed={flippable ? flipped : undefined}
        className={cn(
          "relative w-full outline-none [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4",
          flippable && "cursor-pointer",
        )}
        style={{ aspectRatio: "5 / 7", borderRadius: radius }}
        onPointerDown={(e) => {
          down.current = { x: e.clientX, y: e.clientY }
          dragged.current = false
          onPointerMove(e)
        }}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          if (!dragged.current) toggle()
          release()
        }}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggle()
          }
        }}
      >
        {/* Contact shadow that leans with the card */}
        <div
          ref={shadowRef}
          aria-hidden
          className="pointer-events-none absolute -bottom-[7%] left-[10%] h-[8%] w-[80%] rounded-[50%] bg-black/35 blur-xl"
        />
        <div ref={tiltRef} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${flipped ? 180 : 0}deg)`,
              transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ ...faceStyle, boxShadow: "0 30px 60px -25px rgba(0,0,0,0.55)" }}
            >
              {front}
              {finish && (
                <>
                  {webgl && visible && (
                    <canvas
                      ref={canvasRef}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      style={{ mixBlendMode: "screen", opacity: gpuFoil ? foilOpacity : 0 }}
                    />
                  )}
                  {!gpuFoil && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: CSS_FOIL[finish],
                        backgroundSize: "400% 400%",
                        backgroundPosition: "var(--gx, 50%) var(--gy, 50%)",
                        mixBlendMode: "color-dodge",
                        opacity: foilOpacity * 0.45,
                      }}
                    />
                  )}
                </>
              )}
              <Glare radius={radius} />
            </div>
            {/* Back */}
            <div className="absolute inset-0 overflow-hidden" style={{ ...faceStyle, transform: "rotateY(180deg)" }}>
              {back}
              <Glare radius={radius} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Glare({ radius }: { radius: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        borderRadius: radius,
        background:
          "radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 28%, transparent 55%)",
        mixBlendMode: "overlay",
        opacity: "var(--shine, 0.5)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
      }}
    />
  )
}

export default HoloCard
