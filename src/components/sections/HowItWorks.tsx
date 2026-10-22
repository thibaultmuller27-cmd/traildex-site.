import { motion } from "framer-motion"
import { FileUp, Lock, PackageCheck, SlidersHorizontal } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { TrailCard } from "@/components/TrailCard"
import { DEMO_CARDS, HERO_CARD } from "@/lib/demo"

function GpxVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e2562b]/10 text-[#e2562b]">
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
          stroke="#e2562b"
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
    ["Prénom", "Camille"],
    ["Course", "Crêtes Vosgiennes"],
    ["Chrono", "7h16"],
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
              (i === 0 ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/5")
            }
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

function DeliveryVisual() {
  const fan = [DEMO_CARDS[1], DEMO_CARDS[3], DEMO_CARDS[6]]
  return (
    <div className="relative flex h-full items-center justify-center">
      {fan.map((c, i) => (
        <motion.div
          key={c.id}
          className="absolute"
          initial={{ rotate: 0, x: 0 }}
          whileInView={{ rotate: (i - 1) * 12, x: (i - 1) * 46 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ zIndex: i === 2 ? 3 : i }}
        >
          <TrailCard card={c} width="118px" webgl={false} flippable={false} idle={false} />
        </motion.div>
      ))}
    </div>
  )
}

const STEPS = [
  {
    n: "01",
    icon: FileUp,
    title: "Importe ton GPX",
    text: "Glisse le fichier de ta montre ou de Strava. Distance, dénivelé, profil et tracé sont calculés instantanément.",
    visual: <GpxVisual />,
  },
  {
    n: "02",
    icon: SlidersHorizontal,
    title: "Personnalise",
    text: "Ton prénom, ton chrono, ton classement, une photo. La carte se met à jour pendant que tu tapes.",
    visual: <FormVisual />,
  },
  {
    n: "03",
    icon: PackageCheck,
    title: "Reçois ta carte",
    text: "Imprimée sur carton premium, finition Holo ou Or. Livrée sous étui, prête à collectionner.",
    visual: <DeliveryVisual />,
  },
]

export function HowItWorks() {
  return (
    <section id="comment" className="bg-white px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow text-[#e2562b]">Comment ça marche</p>
          <h2 className="headline mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            Du GPX à la carte.
            <br />
            <span className="text-muted">En trois étapes.</span>
          </h2>
        </FadeIn>
        <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.12}>
              <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-mist p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-semibold text-muted">{s.n}</span>
                  <s.icon className="h-5 w-5 text-muted" strokeWidth={1.6} />
                </div>
                <div className="my-6 h-56">{s.visual}</div>
                <h3 className="text-[24px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-muted">{s.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>
        <FadeIn>
          <p className="mt-10 flex items-center justify-center gap-2 text-center text-[14px] text-muted">
            <Lock className="h-4 w-4" /> Ton fichier GPX est lu directement dans ton navigateur. Rien n'est envoyé sur un serveur.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
