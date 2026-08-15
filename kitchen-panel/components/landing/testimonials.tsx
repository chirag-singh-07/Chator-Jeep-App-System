import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { IMAGES } from "@/lib/images";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { ScrollReveal } from "./scroll-reveal";

const reviews = [
  {
    id: 1,
    name: "Aman Sharma",
    location: "Owner, Ahmedabad Outlet",
    rating: 5,
    text: "Before using this platform, managing busy rush hours was pure chaos. Now, incoming orders sync instantly and the team stays in complete sync. Recommended!",
    avatar: IMAGES.avatars.user1,
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Kitchen Manager, Bodakdev",
    rating: 5,
    text: "The Kitchen Display System screen is extremely clear. Staff prepare dishes according to notes with zero mistakes, and marking items ready takes one click.",
    avatar: IMAGES.avatars.user2,
  },
  {
    id: 3,
    name: "Rohan Mehta",
    location: "Operator, Prahlad Nagar",
    rating: 4.8,
    text: "We haven't missed a single ticket since adopting this control panel. Sound notifications alert us instantly, and toggling unavailable menu items is incredibly fast.",
    avatar: IMAGES.avatars.user3,
  },
  {
    id: 4,
    name: "Sneha Shah",
    location: "Operations Administrator",
    rating: 5,
    text: "Reviewing daily sales and order performance metrics has never been simpler. The analytics are clean, clean data boundaries protect settings, and payouts are rapid.",
    avatar: IMAGES.avatars.user4,
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="py-16 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Title */}
        <ScrollReveal>
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-zinc-50 mt-2">
              What Kitchen Teams Say ❤️
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Feedback and operational stories from active restaurant managers and operators.
            </p>
          </div>
        </ScrollReveal>

        {/* Responsive Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((rev, idx) => (
            <ScrollReveal key={rev.id} delay={idx * 75} animation="fade-in-up">
              <Card className="rounded-2xl border bg-card flex flex-col h-full hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 p-6 group">
                
                {/* Header: User Avatar & Details */}
                <div className="flex items-center gap-3.5 mb-4 shrink-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border bg-zinc-100 shrink-0">
                    <Image
                      src={rev.avatar}
                      alt={rev.name}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-heading text-sm font-bold leading-tight text-foreground dark:text-zinc-50">
                      {rev.name}
                    </h4>
                    <span className="text-xs text-muted-foreground leading-tight block mt-0.5">
                      {rev.location}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 text-amber-500 mb-3 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <HugeiconsIcon
                      key={i}
                      icon={StarIcon}
                      size={14}
                      strokeWidth={2}
                      className={i < Math.floor(rev.rating) ? "fill-amber-500 text-amber-500" : "text-zinc-300 dark:text-zinc-700"}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground dark:text-zinc-50 ml-1.5">{rev.rating}</span>
                </div>

                {/* Text content */}
                <CardContent className="p-0 flex-grow text-left">
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
