import { motion } from "framer-motion"
import { Gift, Map, Shirt, Swords } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { Avatar } from "@/game/components/Avatar"
import { ChestIcon } from "@/game/components/ChestIcon"
import { RARITY_STYLE } from "@/game/config"

const FEATURES = [
  { icon: Map, title: "Les vrais sentiers", text: "La carte affiche les chemins réels autour de toi. Cours-les pour les découvrir et les compléter." },
  { icon: Gift, title: "Des trésors chaque jour", text: "Des coffres apparaissent sur les sentiers. Approche-toi à moins de 35 m pour les ouvrir." },
  { icon: Swords, title: "Des défis", text: "Premiers pas, Semi, Marathon, Cartographe… chaque défi débloque un équipement." },
  { icon: Shirt, title: "Un avatar qui évolue", text: "De Randonneur à Légende des cimes : aura holographique, frontale, bâtons, couronne de laurier." },
]

const EVOLUTION = [
  { level: 1, equipped: { shirt: "tee-gris", shoes: "chaussures-base" } },
  { level: 3, equipped: { shirt: "tee-orange", shoes: "chaussures-base", head: "casquette", vest: "gilet-hydra" } },
  { level: 5, equipped: { shirt: "tee-ocean", shoes: "chaussures-carbone", head: "frontale", vest: "sac-ultra", hands: "batons" } },
  { level: 6, equipped: { shirt: "maillot-or", shoes: "chaussures-holo", head: "laurier", vest: "gilet-hydra", hands: "batons", neck: "buff" } },
]

export function Quest() {
  return (
    <section id="jeu" className="relative overflow-hidden bg-[#0c0b1d] px-5 py-24 text-white md:py-36">
      <div className="pointer-events-none absolute -right-40 -top-20 h-[30rem] w-[30rem] rounded-full bg-[#c774e8]/25 blur-[130px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#8cffb0]/15 blur-[130px]" />
      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow text-[#94d0ff]">Nouveau · TrailDex Quest</p>
          <h2 className="headline mt-3 max-w-3xl text-[40px] sm:text-6xl md:text-7xl">
            La chasse au trésor
            <br />
            <span className="text-gradient-holo">sur les sentiers.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/60">
            Comme Pokémon Go, mais pour les traileurs. Sors courir, trouve les coffres cachés sur la carte et gagne des codes promo et des lots rares de marques de trail.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="holo-border mt-14 grid grid-cols-2 gap-4 rounded-[32px] bg-gradient-to-br from-[#1d1640] via-[#120f2b] to-[#0c1f33] p-6 sm:grid-cols-4 md:p-10">
            {EVOLUTION.map((e, i) => (
              <motion.div
                key={e.level}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
              >
                <Avatar equipped={e.equipped} level={e.level} size={130} />
                <p className="mt-2 font-mono text-[12px] text-white/50">Niveau {e.level}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <article className="h-full rounded-[24px] bg-white/[0.05] p-6 ring-1 ring-white/10">
                <f.icon className="h-6 w-6 text-[#c774e8]" strokeWidth={1.6} />
                <h3 className="mt-4 text-[19px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-white/60">{f.text}</p>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="mt-6 flex flex-col items-center justify-between gap-6 rounded-[24px] bg-white/[0.05] p-6 ring-1 ring-white/10 md:flex-row">
            <div className="flex items-end gap-4">
              {(Object.keys(RARITY_STYLE) as (keyof typeof RARITY_STYLE)[]).map((r, i) => (
                <div key={r} className="chest-marker text-center" style={{ animationDelay: `${i * 0.3}s`, filter: `drop-shadow(0 0 14px ${RARITY_STYLE[r].glow})` }}>
                  <ChestIcon color={RARITY_STYLE[r].color} size={36 + i * 8} />
                  <p className="mt-1 text-[11px]" style={{ color: RARITY_STYLE[r].color }}>
                    {RARITY_STYLE[r].label}
                  </p>
                </div>
              ))}
            </div>
            <a href="/jeu/" className="holo-bg inline-flex h-14 items-center rounded-full px-8 text-[17px] font-semibold text-[#0c0b1d] shadow-[0_15px_40px_-10px_rgba(255,106,213,.7)]">
              Jouer maintenant
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
