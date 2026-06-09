import { Hero } from '@/features/home/Hero'
import { FeatureCards } from '@/features/home/FeatureCards'
import { DetailSections } from '@/features/home/SectionPanels'

export function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <DetailSections />
    </>
  )
}
