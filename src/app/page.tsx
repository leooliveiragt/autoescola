import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/layout/hero-section'
import { TrustBar } from '@/components/layout/trust-bar'
import { HowItWorks } from '@/components/layout/how-it-works'
import { FeaturedInstructors } from '@/components/layout/featured-instructors'
import { InstructorCTA } from '@/components/layout/instructor-cta'
import { TestimonialsSection } from '@/components/layout/testimonials-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturedInstructors />
      <TestimonialsSection />
      <InstructorCTA />
      <Footer />
    </div>
  )
}
