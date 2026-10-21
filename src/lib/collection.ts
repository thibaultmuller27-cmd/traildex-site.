import * as React from "react"
import type { CardData } from "./card"
import { DEMO_CARDS } from "./demo"

const KEY = "traildex.collection.v1"

/** Starter collection, so the gamification has something to show. */
const STARTER = [DEMO_CARDS[1], DEMO_CARDS[3]]

function load(): CardData[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* private mode or corrupt data: fall back to the starter set */
  }
  return STARTER
}

type Store = { cards: CardData[]; add: (c: CardData) => void; reset: () => void }
const Ctx = React.createContext<Store | null>(null)

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = React.useState<CardData[]>(load)
  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cards))
    } catch {
      // Quota exceeded (large photos): keep the cards, drop the photos.
      try {
        localStorage.setItem(KEY, JSON.stringify(cards.map(({ photo: _p, ...c }) => c)))
      } catch {
        /* storage unavailable */
      }
    }
  }, [cards])
  const value = React.useMemo<Store>(
    () => ({
      cards,
      add: (c) => setCards((prev) => [c, ...prev.filter((p) => p.id !== c.id)]),
      reset: () => setCards(STARTER),
    }),
    [cards],
  )
  return React.createElement(Ctx.Provider, { value }, children)
}

export function useCollection() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useCollection outside provider")
  return v
}
