import * as React from "react"
import { createPortal } from "react-dom"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Lock } from "lucide-react"
import { REACH_M, RARITY_STYLE } from "../config"
import { circle, type LngLat } from "../lib/geo"
import type { Trail, Treasure } from "../lib/trails"
import type { GameState } from "../lib/state"
import { cn } from "@/lib/utils"
import { ChestIcon } from "./ChestIcon"

const STYLE = "https://tiles.openfreemap.org/styles/liberty"

/** Dreamy, slightly iridescent recolor of the base map (Pokémon Go vibe). */
function stylize(map: maplibregl.Map) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id
    try {
      if (layer.type === "background") map.setPaintProperty(id, "background-color", "#dfe9d6")
      else if (layer.type === "symbol" && /poi|transit|airport|housenumber/.test(id)) map.setLayoutProperty(id, "visibility", "none")
      else if (layer.type === "fill" && /water/.test(id)) map.setPaintProperty(id, "fill-color", "#8fd3ff")
      else if (layer.type === "fill" && /wood|forest/.test(id)) map.setPaintProperty(id, "fill-color", "#9fd9a0")
      else if (layer.type === "fill" && /grass|park|landcover|meadow|scrub/.test(id)) map.setPaintProperty(id, "fill-color", "#c3ecb2")
      else if (layer.type === "fill" && /building/.test(id)) map.setPaintProperty(id, "fill-color", "#e7defa")
      else if (layer.type === "fill-extrusion") map.setPaintProperty(id, "fill-extrusion-color", "#e2d7ff")
      else if (layer.type === "line" && /road|highway|street/.test(id) && !/path|track/.test(id)) map.setPaintProperty(id, "line-color", "#fbfaff")
    } catch {
      /* layer without that paint property */
    }
  }
}

type Props = {
  player: LngLat | null
  trails: Trail[]
  treasures: Treasure[]
  state: GameState
  premium: boolean
  follow: boolean
  onFollowChange: (f: boolean) => void
  onMapClick: (p: LngLat) => void
  onChestClick: (t: Treasure) => void
  avatar: React.ReactNode
}

export function MapView({ player, trails, treasures, state, premium, follow, onFollowChange, onMapClick, onChestClick, avatar }: Props) {
  const el = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<maplibregl.Map | null>(null)
  const [ready, setReady] = React.useState(false)
  const playerMarker = React.useRef<maplibregl.Marker | null>(null)
  const [playerEl, setPlayerEl] = React.useState<HTMLDivElement | null>(null)
  const [chestEls, setChestEls] = React.useState<Record<string, HTMLDivElement>>({})
  const chestMarkers = React.useRef<Record<string, maplibregl.Marker>>({})
  const clickRef = React.useRef(onMapClick)
  clickRef.current = onMapClick
  const followRef = React.useRef(onFollowChange)
  followRef.current = onFollowChange

  // Init once
  React.useEffect(() => {
    if (!el.current) return
    const m = new maplibregl.Map({
      container: el.current,
      style: STYLE,
      center: player ?? [6.8694, 45.9237],
      zoom: 16.3,
      pitch: 58,
      maxPitch: 70,
      attributionControl: { compact: true },
    })
    map.current = m
    m.on("load", () => {
      stylize(m)
      m.addSource("trails", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
      m.addLayer({
        id: "trails-glow",
        type: "line",
        source: "trails",
        paint: {
          "line-color": ["match", ["get", "state"], 2, "#ffcf5a", 1, "#c774e8", "#ffffff"],
          "line-width": 14,
          "line-blur": 8,
          "line-opacity": ["match", ["get", "state"], 0, 0.5, 0.75],
        },
        layout: { "line-cap": "round", "line-join": "round" },
      })
      // Undiscovered trails are dashed, discovered ones solid (dasharray can't be data-driven).
      m.addLayer({
        id: "trails-hidden",
        type: "line",
        source: "trails",
        filter: ["==", ["get", "state"], 0],
        paint: { "line-color": "#6b7a99", "line-width": 4, "line-dasharray": [1.5, 1.5] },
      })
      m.addLayer({
        id: "trails-line",
        type: "line",
        source: "trails",
        filter: ["!=", ["get", "state"], 0],
        paint: { "line-color": ["match", ["get", "state"], 2, "#ffb703", "#8b5cf6"], "line-width": 5 },
        layout: { "line-cap": "round", "line-join": "round" },
      })
      m.addSource("visited", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
      m.addLayer({
        id: "visited",
        type: "circle",
        source: "visited",
        paint: { "circle-radius": 3, "circle-color": "#fff", "circle-stroke-color": "#c774e8", "circle-stroke-width": 1.5 },
      })
      m.addSource("reach", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
      m.addLayer({ id: "reach-fill", type: "fill", source: "reach", paint: { "fill-color": "#94d0ff", "fill-opacity": 0.18 } })
      m.addLayer({ id: "reach-line", type: "line", source: "reach", paint: { "line-color": "#ffffff", "line-width": 2, "line-opacity": 0.9 } })
      setReady(true)
    })
    m.on("click", (e) => {
      // Marker clicks bubble through the map container too: those are chest taps, not moves.
      if ((e.originalEvent.target as HTMLElement | null)?.closest(".maplibregl-marker")) return
      clickRef.current([e.lngLat.lng, e.lngLat.lat])
    })
    m.on("dragstart", () => followRef.current(false))
    return () => {
      m.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trails layer
  React.useEffect(() => {
    const src = map.current?.getSource("trails") as maplibregl.GeoJSONSource | undefined
    const vis = map.current?.getSource("visited") as maplibregl.GeoJSONSource | undefined
    if (!ready || !src || !vis) return
    src.setData({
      type: "FeatureCollection",
      features: trails.map((t) => {
        const s = state.trails[t.id]
        const done = s && s.visited.length / s.total >= 0.9
        return {
          type: "Feature",
          properties: { state: done ? 2 : s ? 1 : 0, name: t.name },
          geometry: { type: "LineString", coordinates: t.points },
        }
      }),
    })
    vis.setData({
      type: "FeatureCollection",
      features: trails.flatMap((t) =>
        (state.trails[t.id]?.visited ?? [])
          .filter((i) => i % 2 === 0)
          .map((i) => ({ type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: t.points[i] } })),
      ),
    })
  }, [ready, trails, state.trails])

  // Player marker + reach circle + camera
  React.useEffect(() => {
    const m = map.current
    if (!ready || !m || !player) return
    if (!playerMarker.current) {
      const div = document.createElement("div")
      playerMarker.current = new maplibregl.Marker({ element: div, anchor: "bottom" }).setLngLat(player).addTo(m)
      setPlayerEl(div)
      m.jumpTo({ center: player })
    } else playerMarker.current.setLngLat(player)
    ;(m.getSource("reach") as maplibregl.GeoJSONSource).setData(circle(player, REACH_M))
    if (follow) m.easeTo({ center: player, duration: 300 })
  }, [ready, player, follow])

  // Chest markers (one DOM node per treasure, React renders into it)
  React.useEffect(() => {
    const m = map.current
    if (!ready || !m) return
    const keep = new Set(treasures.filter((t) => !state.opened[t.id]).map((t) => t.id))
    const els: Record<string, HTMLDivElement> = {}
    for (const [id, mk] of Object.entries(chestMarkers.current)) {
      if (!keep.has(id)) {
        mk.remove()
        delete chestMarkers.current[id]
      }
    }
    for (const t of treasures) {
      if (!keep.has(t.id)) continue
      let mk = chestMarkers.current[t.id]
      if (!mk) {
        const div = document.createElement("div")
        mk = new maplibregl.Marker({ element: div, anchor: "bottom" }).setLngLat(t.at).addTo(m)
        chestMarkers.current[t.id] = mk
      }
      els[t.id] = mk.getElement() as HTMLDivElement
    }
    setChestEls(els)
  }, [ready, treasures, state.opened])

  return (
    <>
      {/* maplibre's own CSS forces position:relative on the container, so wrap it */}
      <div className="absolute inset-0">
        <div ref={el} className="h-full w-full" />
      </div>
      {playerEl && createPortal(<div className="pointer-events-none">{avatar}</div>, playerEl)}
      {treasures.map((t) => {
        const node = chestEls[t.id]
        if (!node) return null
        return createPortal(
          <ChestMarker treasure={t} locked={t.rarity === "legendaire" && !premium} onClick={() => onChestClick(t)} />,
          node,
          t.id,
        )
      })}
    </>
  )
}

function ChestMarker({ treasure, locked, onClick }: { treasure: Treasure; locked: boolean; onClick: () => void }) {
  const st = RARITY_STYLE[treasure.rarity]
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="group relative grid cursor-pointer place-items-center"
      aria-label={`Coffre ${st.label}`}
    >
      <span
        className="absolute bottom-0 h-6 w-10 rounded-full"
        style={{ background: st.glow, filter: "blur(8px)", animation: "ping-ring 2.4s ease-out infinite" }}
      />
      <span className="chest-marker relative" style={{ filter: `drop-shadow(0 0 10px ${st.glow})` }}>
        <ChestIcon color={st.color} size={treasure.rarity === "legendaire" ? 50 : 40} locked={locked} />
        {locked && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#0c0b1d] text-[#ffcf5a] ring-1 ring-[#ffcf5a]">
            <Lock className="h-3 w-3" />
          </span>
        )}
      </span>
      <span className={cn("mt-0.5 h-1.5 w-6 rounded-full bg-black/25 blur-[2px]")} />
    </button>
  )
}
