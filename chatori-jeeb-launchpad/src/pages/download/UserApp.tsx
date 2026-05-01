import { DownloadLayout } from "@/components/download/DownloadLayout";
import { StoreButtons } from "@/components/download/StoreButtons";
import { PhoneMockup } from "@/components/download/PhoneMockup";
import { ShoppingBag, MapPin, Utensils, Zap, Star } from "lucide-react";

const features = [
  { Icon: ShoppingBag, title: "Easy ordering", text: "A few taps to your favourite meal." },
  { Icon: MapPin, title: "Live tracking", text: "Follow your order in real time." },
  { Icon: Utensils, title: "Multiple cuisines", text: "From biryani to bao — explore it all." },
  { Icon: Zap, title: "Fast delivery", text: "Lightning-fast riders near you." },
];

const screens = [
  { title: "Browse", text: "Curated home feed personalised for your cravings." },
  { title: "Menu", text: "Beautiful menus with photos, ratings and offers." },
  { title: "Track", text: "Live map tracking until your food arrives." },
];

const reviews = [
  { name: "Aarav S.", rating: 5, text: "Fastest delivery I've used. Tracking is buttery smooth." },
  { name: "Meera K.", rating: 5, text: "The app is gorgeous and the offers are unbeatable." },
  { name: "Rohit P.", rating: 4, text: "Love the variety. My weekend chaat run is sorted." },
];

const UserApp = () => {
  return (
    <DownloadLayout
      title="Craving Something Delicious?"
      eyebrow="User App"
      description="Download the Chatori Jeeb app to order food, track deliveries in real time and enjoy fast service across India."
      path="/app/user"
      hero={
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <StoreButtons />
            <p className="mt-4 text-sm text-muted-foreground">Available on iOS and Android. Free to download.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="animate-fade-in">
              <PhoneMockup label="User app preview" />
            </div>
          </div>
        </div>
      }
    >
      <section aria-labelledby="features">
        <h2 id="features" className="text-2xl md:text-3xl font-extrabold">Built for hungry foodies</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ Icon, title, text }, i) => (
            <div
              key={title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="screens" className="mt-20">
        <h2 id="screens" className="text-2xl md:text-3xl font-extrabold">A peek inside the app</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-10">
          {screens.map((s, i) => (
            <div key={s.title} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="animate-fade-in">
                <PhoneMockup label={`${s.title} screen`} />
              </div>
              <h3 className="mt-5 font-bold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="reviews" className="mt-20">
        <h2 id="reviews" className="text-2xl md:text-3xl font-extrabold">Loved by chatoris</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <article key={r.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-1 text-primary-deep" aria-label={`${r.rating} star rating`}>
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-foreground/90">"{r.text}"</p>
              <div className="mt-4 text-sm font-semibold text-muted-foreground">{r.name}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-gradient-primary text-primary-foreground p-10 md:p-14 text-center shadow-elegant">
        <h2 className="text-3xl md:text-4xl font-extrabold">Hungry already?</h2>
        <p className="mt-3 opacity-90 max-w-xl mx-auto">Download the Chatori Jeeb app and get your first order delivered in minutes.</p>
        <div className="mt-6"><StoreButtons align="center" /></div>
      </section>
    </DownloadLayout>
  );
};

export default UserApp;