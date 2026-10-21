import { CollectionProvider } from "@/lib/collection"
import { Nav } from "@/components/sections/Nav"
import { Hero } from "@/components/sections/Hero"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Creator } from "@/components/sections/Creator"
import { Gallery } from "@/components/sections/Gallery"
import { Collection } from "@/components/sections/Collection"
import { Faq } from "@/components/sections/Faq"
import { Footer } from "@/components/sections/Footer"

export default function App() {
  return (
    <CollectionProvider>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Creator />
        <Gallery />
        <Collection />
        <Faq />
      </main>
      <Footer />
    </CollectionProvider>
  )
}
