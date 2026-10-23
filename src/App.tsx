import { CollectionProvider } from "@/lib/collection"
import { Nav } from "@/components/sections/Nav"
import { Hero } from "@/components/sections/Hero"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Creator } from "@/components/sections/Creator"
import { Collection } from "@/components/sections/Collection"
import { Faq } from "@/components/sections/Faq"
import { Footer } from "@/components/sections/Footer"
import { PaymentReturn } from "@/components/sections/PaymentReturn"

export default function App() {
  return (
    <CollectionProvider>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Creator />
        <Collection />
        <Faq />
      </main>
      <Footer />
      <PaymentReturn />
    </CollectionProvider>
  )
}
