import { motion } from "framer-motion"
import { Bike, FileUp, Lock, Mountain, PenLine, Footprints } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { HERO_CARD } from "@/lib/demo"

function GpxVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e2562b]/10 text-mint">
          <FileUp className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-[13px] font-semibold">cretes-vosgiennes.gpx</p>
          <p className="text-[12px] text-muted">1 514 points · 412 Ko</p>
        </div>
      </div>
      <svg viewBox="0 0 100 100" className="h-32 w-32">
        <motion.path
          d={HERO_CARD.routePath}
          fill="none"
          stroke="#1fd6a0"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}

function FormVisual() {
  const rows = [
    ["Blaze", "La Fusée"],
    ["Course", "Crêtes Vosgiennes"],
    ["Chrono", "7h16 (sans pause tartiflette)"],
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-2">
      {rows.map(([k, v], i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-[14px] shadow-sm ring-1 ring-black/5"
        >
          <span className="text-muted">{k}</span>
          <span className="font-medium">{v}</span>
        </motion.div>
      ))}
      <div className="mt-1 flex gap-2">
        {["Holo", "Or"].map((f, i) => (
          <span
            key={f}
            className={
              "flex-1 rounded-full py-2 text-center text-[12px] font-semibold " +
              (i === 0 ? "bg-lime text-night" : "bg-white text-ink ring-1 ring-black/5")
            }
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}


function DisciplineVisual() {
  const items = [
    { icon: Mountain, label: "Trail", note: "boue incluse", c: "bg-mint" },
    { icon: Footprints, label: "Running", note: "bitume chaud", c: "bg-lime" },
    { icon: Bike, label: "Vélo", note: "cuissard fourni*", c: "bg-violet text-white" },
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-2">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.15, duration: 0.6 }}
          className={"flex items-center justify-between rounded-xl px-4 py-3 text-night ring-2 ring-[#160a2e] " + it.c}
        >
          <span className="flex items-center gap-2 font-display text-[18px] tracking-wide"><it.icon className="h-5 w-5" /> {it.label}</span>
          <span className="text-[12px] font-semibold opacity-80">{it.note}</span>
        </motion.div>
      ))}
      <p className="text-center text-[11px] text-muted">*non, pas fourni.</p>
    </div>
  )
}
const STEPS = [
  {
    n: "01",
    icon: Mountain,
    title: "Choisis ta discipline",
    text: "Trail, running ou vélo. Aucun jugement : même ceux qui marchent dans les montées (tout le monde) ont droit à leur carte.",
    visual: <DisciplineVisual />,
  },
  {
    n: "02",
    icon: PenLine,
    title: "Ton nom (ou ton blaze)",
    text: "Prénom, surnom de club, « La Fusée », « Tonton »… C'est toi qui signes. On ne vérifie pas que tu cours vraiment comme une fusée.",
    visual: <FormVisual />,
  },
  {
    n: "03",
    icon: FileUp,
    title: "Glisse ton GPX",
    text: "Le fichier de ta montre ou de Strava. On calcule tout : distance, D+, profil… et même les 400 m de détour quand tu t'es perdu au km 32.",
    visual: <GpxVisual />,
  },
]

export function HowItWorks() {
  return (
    <section id="comment" className="bg-night px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow text-mint">Comment ça marche</p>
          <h2 className="headline mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            Discipline, blaze, GPX.
            <br />
            <span className="text-gradient-dnf">Et c'est dans la boîte.</span>
          </h2>
        </FadeIn>
        <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.12}>
              <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-mist p-7 ring-2 ring-[#160a2e] md:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-semibold text-muted">{s.n}</span>
                  <s.icon className="h-5 w-5 text-muted" strokeWidth={1.6} />
                </div>
                <div className="my-6 h-56">{s.visual}</div>
                <h3 className="font-display text-[26px] tracking-wide text-lime">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-muted">{s.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>
        <FadeIn>
          <p className="mt-10 flex items-center justify-center gap-2 text-center text-[14px] text-muted">
            <Lock className="h-4 w-4" /> Ton GPX est lu directement dans ton navigateur. Rien ne part sur un serveur, même pas tes temps de pause.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
