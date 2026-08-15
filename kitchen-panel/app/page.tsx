import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FoodCategories } from "@/components/landing/food-categories";
import { PopularDishes } from "@/components/landing/popular-dishes";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { AboutSection } from "@/components/landing/about-section";
import { OfferBanner } from "@/components/landing/offer-banner";
import { Testimonials } from "@/components/landing/testimonials";
import { LocationSection } from "@/components/landing/location-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FoodCategories />
        <PopularDishes />
        <WhyChooseUs />
        <AboutSection />
        <OfferBanner />
        <Testimonials />
        <LocationSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
