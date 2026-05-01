import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Legal = lazy(() => import("./pages/legal/Legal.tsx"));
const Terms = lazy(() => import("./pages/legal/Terms.tsx"));
const Privacy = lazy(() => import("./pages/legal/Privacy.tsx"));
const Cookies = lazy(() => import("./pages/legal/Cookies.tsx"));
const Licenses = lazy(() => import("./pages/legal/Licenses.tsx"));

const Support = lazy(() => import("./pages/support/Support.tsx"));
const Contact = lazy(() => import("./pages/support/Contact.tsx"));
const HelpCenter = lazy(() => import("./pages/support/HelpCenter.tsx"));
const Safety = lazy(() => import("./pages/support/Safety.tsx"));
const PartnerHelp = lazy(() => import("./pages/support/PartnerHelp.tsx"));

const Company = lazy(() => import("./pages/company/Company.tsx"));
const About = lazy(() => import("./pages/company/About.tsx"));
const Careers = lazy(() => import("./pages/company/Careers.tsx"));
const Press = lazy(() => import("./pages/company/Press.tsx"));
const Blog = lazy(() => import("./pages/company/Blog.tsx"));

const Download = lazy(() => import("./pages/download/Download.tsx"));
const UserApp = lazy(() => import("./pages/download/UserApp.tsx"));
const PartnerApp = lazy(() => import("./pages/download/PartnerApp.tsx"));
const RestaurantApp = lazy(() => import("./pages/download/RestaurantApp.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/partner-help" element={<PartnerHelp />} />
            <Route path="/company" element={<Company />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/download" element={<Download />} />
            <Route path="/app/user" element={<UserApp />} />
            <Route path="/app/partner" element={<PartnerApp />} />
            <Route path="/app/restaurant" element={<RestaurantApp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
