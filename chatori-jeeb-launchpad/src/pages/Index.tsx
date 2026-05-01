import { lazy, Suspense, useEffect } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";

// Code-split everything below the fold to keep the initial JS payload small.
const Categories = lazy(() => import("@/components/sections/Categories").then(m => ({ default: m.Categories })));
const Features = lazy(() => import("@/components/sections/Features").then(m => ({ default: m.Features })));
const TopRestaurants = lazy(() => import("@/components/sections/TopRestaurants").then(m => ({ default: m.TopRestaurants })));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })));
const AppShowcase = lazy(() => import("@/components/sections/AppShowcase").then(m => ({ default: m.AppShowcase })));
const EarningsCalculator = lazy(() => import("@/components/sections/EarningsCalculator").then(m => ({ default: m.EarningsCalculator })));
const Promo = lazy(() => import("@/components/sections/Promo").then(m => ({ default: m.Promo })));
const WhyChooseUs = lazy(() => import("@/components/sections/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const RestaurantGrowth = lazy(() => import("@/components/sections/RestaurantGrowth").then(m => ({ default: m.RestaurantGrowth })));
const Stats = lazy(() => import("@/components/sections/Stats").then(m => ({ default: m.Stats })));
const Coverage = lazy(() => import("@/components/sections/Coverage").then(m => ({ default: m.Coverage })));
const Testimonials = lazy(() => import("@/components/sections/Testimonials").then(m => ({ default: m.Testimonials })));
const Blog = lazy(() => import("@/components/sections/Blog").then(m => ({ default: m.Blog })));
const FAQ = lazy(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })));
const AppDownload = lazy(() => import("@/components/sections/AppDownload").then(m => ({ default: m.AppDownload })));
const CTA = lazy(() => import("@/components/sections/CTA").then(m => ({ default: m.CTA })));
const Footer = lazy(() => import("@/components/sections/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  useEffect(() => {
    document.title = "Chatori Jeeb — Order food, deliver, or grow your restaurant";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("description", "Chatori Jeeb is India's vibrant food delivery platform — order delicious food, earn as a delivery partner, or grow your restaurant. All in one app.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.origin + "/";
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <Categories />
        <Features />
        <TopRestaurants />
        <HowItWorks />
        <AppShowcase />
        <EarningsCalculator />
        <Promo />
        <WhyChooseUs />
        <RestaurantGrowth />
        <Stats />
        <Coverage />
        <Testimonials />
        <Blog />
        <FAQ />
        <AppDownload />
        <CTA />
        <Footer />
      </Suspense>
      <BackToTop />
    </main>
  );
};

export default Index;
