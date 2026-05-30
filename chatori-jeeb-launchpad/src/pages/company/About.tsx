import { useState } from "react";
import { CompanyLayout } from "@/components/company/CompanyLayout";
import { Target, Eye, Heart, MapPin, ShoppingBag, Bike, Quote } from "lucide-react";

const stats = [
  { Icon: MapPin, label: "Cities served", value: "50+" },
  { Icon: ShoppingBag, label: "Orders delivered", value: "2M+" },
  { Icon: Bike, label: "Active partners", value: "10K+" },
];

const pillars = [
  { Icon: Target, title: "Mission", text: "Make food delivery fair, transparent, and rewarding for every Indian kitchen, chef, and household." },
  { Icon: Eye, title: "Vision", text: "Be the most loved food platform across India — from metros to tier-3 towns, empowering local kitchens over corporate giants." },
  { Icon: Heart, title: "Story", text: "Chatori Jeeb started with tears in a kitchen owner's eyes and grew into a revolution for the forgotten hands of Indian food." },
];

const About = () => {
  const [isHindi, setIsHindi] = useState(false);

  return (
    <CompanyLayout
      title="About Chatori Jeeb"
      eyebrow="Our Story"
      description="The passionate journey of Chatori Jeeb — born from struggles of local kitchens, built for food lovers across India."
      path="/about"
      headerExtra={
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsHindi(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !isHindi ? "bg-primary-deep text-white" : "bg-white/80 text-foreground hover:bg-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setIsHindi(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isHindi ? "bg-primary-deep text-white" : "bg-white/80 text-foreground hover:bg-white"
            }`}
          >
            हिंदी में पढ़ें
          </button>
        </div>
      }
    >
      {/* Story Section */}
      <section aria-labelledby="story" className="mb-16">
        <h2 id="story" className="text-3xl md:text-4xl font-extrabold text-center mb-8">
          {isHindi ? "हमारी कहानी" : "Our Story"}
        </h2>

        {!isHindi ? (
          // English Story
          <div className="space-y-8 text-muted-foreground">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                This isn't a story crafted inside an air-conditioned corporate cabin or born out of a fancy business spreadsheet.
                This is a story of raw human emotion, <strong className="text-foreground">sleepless nights</strong>, and a fierce
                battle fought alongside the local kitchens and passionate chefs we see around us every day.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">When the Stove Burned, But the Home Couldn't Survive</h3>
              <p className="leading-relaxed mb-6">
                There was a time when cooking wasn't just a commercial transaction; it was a deeply personal bond. Then came
                the era of massive corporate food tech aggregators. Initially, it felt like a tech revolution that would bring
                joy to everyone. But slowly, the soul of authentic food got buried beneath ruthless algorithms, exorbitant
                commissions, and the illusion of convenience.
              </p>
              <div className="bg-white rounded-2xl p-6 border-l-4 border-primary-deep shadow-sm">
                <Quote className="h-8 w-8 text-primary-deep mb-3" />
                <p className="text-foreground italic text-lg leading-relaxed">
                  "Brother, I sweat in front of the tandoor all day, burning my hands. But at the end of the month, when the
                  bill for high commissions and advertising costs from these large delivery platforms arrives... I am left
                  with nothing, not even enough for my children's school fees. Their corporate algorithm swallows all my
                  hard work."
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">— A proud local kitchen owner, with tears in his eyes</p>
              </div>
              <p className="mt-6 leading-relaxed">
                He wasn't alone. We witnessed countless passionate kitchen owners shutting down simply because they couldn't
                even afford their monthly rent. The corporate delivery giants squeezed them so hard that without offering
                deep discounts, they got no visibility; and by offering those discounts, they were left bankrupt. The
                chef's sweat and the customer's hard-earned money were both being drained by the middleman.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">David vs. Goliath: Standing Up to Corporate Giants</h3>
              <p className="leading-relaxed mb-4">
                When we decided to build <strong className="text-foreground">Chatori Jeeb</strong>, people laughed at us.
                They said: <em>"Are you out of your mind? These major food delivery aggregators are multi-billion-dollar
                empires with endless funding. They will crush you in a heartbeat."</em>
              </p>
              <p className="leading-relaxed mb-4">
                We didn't have deep-pocketed institutional investors or millions in our bank accounts. But we had something
                far more powerful — <strong className="text-foreground">stubborn determination and the trust of those
                heartbroken kitchens.</strong>
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-bold text-foreground mb-2">🌙 Sleepless Nights & Zero Budget</h4>
                  <p className="text-sm">Countless nights staring at the ceiling, figuring out how to build a platform that wouldn't suck the blood out of the food ecosystem.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-bold text-foreground mb-2">🚪 Rejection at Every Door</h4>
                  <p className="text-sm">Local restaurants were deeply skeptical — they had been burned before. Winning back their trust was our hardest mountain to climb.</p>
                </div>
              </div>
              <p className="mt-6 font-medium text-foreground">
                But we refused to back down. We chose to treat them as partners, not as data points or profit channels.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">How We Solved the Corporate Delivery Crisis</h3>
              <p className="leading-relaxed mb-6">
                We didn't just build another mobile application; we dismantled a broken, monopolistic system built purely on
                corporate greed:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</span>
                  <div>
                    <h4 className="font-bold text-foreground">Eliminating Killer Commissions</h4>
                    <p className="text-sm">We slashed the exorbitant commissions that were suffocating local kitchens. Free from financial extortion, chefs can now focus 100% on cooking high-quality, pure food with love.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</span>
                  <div>
                    <h4 className="font-bold text-foreground">Direct Transparency, No Algorithm Games</h4>
                    <p className="text-sm">Large tech platforms manipulate visibility, pushing only brands that pay heavy advertising fees. We ended this playground. On Chatori Jeeb, every kitchen with incredible taste gets a fair spotlight.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</span>
                  <div>
                    <h4 className="font-bold text-foreground">Your Money, Supporting Real Families</h4>
                    <p className="text-sm">When you order from Chatori Jeeb, your money doesn't fly away to a foreign venture fund. It directly supports the local chef and the hard-working families cooking your meal.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-3xl p-8 text-center border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">The Reality Today</h3>
              <p className="text-lg leading-relaxed mb-4">
                Today, Chatori Jeeb is not just a software code or a food delivery app. It is a <strong className="text-primary-deep">revolution (a movement)</strong> born to empower the invisible hands that work tirelessly from dawn to dusk to satisfy your cravings.
              </p>
              <p className="text-lg leading-relaxed">
                We don't make loud corporate noises, but every time a meal reaches your plate through us, it carries the true warmth of a kitchen, a family's blessing, and an uncompromised taste.
              </p>
              <div className="mt-6 p-4 bg-white/80 rounded-xl border border-primary/30">
                <p className="text-xl font-bold text-primary-deep italic">
                  "Because when it comes to food, the right belongs entirely to the creator and the consumer — <u>never the greedy middleman!</u>"
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Hindi Story
          <div className="space-y-8 text-muted-foreground">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                ये कहानी किसी AC cabin में बैठकर लिखे गए business plan की नहीं है। ये कहानी है <strong className="text-foreground">जज्बात की</strong>, उन रातों की जब नींद आखों से गायब थी, और उस संघर्ष की जो हमने अपने आस-पास की छोटी-बड़ी kitchens को लड़ते देखा।
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">जब चूल्हा जलता था, पर घर नहीं चलता था</h3>
              <p className="leading-relaxed mb-6">
                हम सबको लगता है कि एक restaurant चलाना या cloud kitchen खोलना बहुत आसान है। पर इसके पीछे की हक़ीक़त बहुत दर्दनाक थी। जब बड़ी corporate tech aggregators market में आए, तो शुरू में लगा ये बदलाव सबके लिए खुशी लाएगा। पर धीरे-धीरे, खाने का असली एहसास बड़ी-बड़ी corporate कंपनियों के algorithms, high commissions और convenience के झूठे वादों के पीछे छुप गया।
              </p>
              <div className="bg-white rounded-2xl p-6 border-l-4 border-primary-deep shadow-sm">
                <Quote className="h-8 w-8 text-primary-deep mb-3" />
                <p className="text-foreground italic text-lg leading-relaxed">
                  "भाई, दिन भर तंदूर के आगे तपता हूं, हाथ जलते हैं, पर महीने के आखिर में जब बड़े online delivery platforms का commission और ad cost का bill आता है न... तो बच्चों की school fee के पैसे भी नहीं बचते। सारी कमाई उनका corporate algorithm खा जाता है।"
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">— एक ग़ौरवशाली local kitchen owner, आंखों में आंसू</p>
              </div>
              <p className="mt-6 leading-relaxed">
                वो कोई एक अकेला इंसान नहीं था। हमने एक के बाद एक, कई ऐसी kitchens को बंद होते देखा जो अपनी दुकान का rent तक नहीं निकाल पा रहे थे। Online delivery giants ने उन्हें इतना दबा दिया था कि बिना भारी discount दिए उन्हें orders ही नहीं मिलते थे, और discount देने पर उनके पास कुछ नहीं बचता था। खाना बनाने वाले की मेहनत और खाने वाले के पैसे — दोनों बीच के रास्ते में लूटे जा रहे थे।
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">David vs. Goliath: जब हमने Corporate Giants से लड़ने की ठानी</h3>
              <p className="leading-relaxed mb-4">
                जब हमने तय किया कि हम <strong className="text-foreground">Chatori Jeeb</strong> बनाएंगे, तो लोगों ने हमारा मज़ाक उड़ाया। सबने कहा: <em>"तुम पागल हो? वो बड़ी corporate food delivery aggregators trillion-dollar companies हैं। उनके पास हज़ारों करोड़ की funding है। तुम उनसे कैसे लड़ोगे? वो तुम्हें मिटा देंगे।"</em>
              </p>
              <p className="leading-relaxed mb-4">
                हमारे पास कोई बड़े investors नहीं थे, न ही bank accounts में करोड़ों रुपये। पर हमारे पास एक चीज़ थी — <strong className="text-foreground">ज़िद और उन टूटे हुए kitchens का भरोसा।</strong>
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-bold text-foreground mb-2">🌙 बेसोची रातें और Zero Budget</h4>
                  <p className="text-sm">कई ऐसी रातें गुज़रीं जब हम बिना सोए सिर्फ इस बात पर दिमाग लगाते थे कि बिना heavy commission लिए इस platform को कैसे खड़ा किया जाए।</p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-bold text-foreground mb-2">🚪 हर दरवाज़े पर इनकार</h4>
                  <p className="text-sm">जब हम restaurants के पास गए, तो उन्हें यकीन नहीं था। वो डर गए थे। हर tech platform को खून चूसने वाला समझते थे। उनका भरोसा जीतना हमारी ज़िंदगी का सबसे बड़ा संघर्ष था।</p>
                </div>
              </div>
              <p className="mt-6 font-medium text-foreground">
                पर हमने हार नहीं मानी। हमने उन्हें partner की तरह देखा, किसी ज़रिए की तरह नहीं।
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">हमने Corporate Delivery System की कमियों को कैसे दूर किया?</h3>
              <p className="leading-relaxed mb-6">
                हमने सिर्फ एक app नहीं बनाया, बल्कि उस पूरे पुराने, monopolistic system को ध्वस्त कर दिया जो सिर्फ अपना मुनाफा देखता था:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</span>
                  <div>
                    <h4 className="font-bold text-foreground">Commission का ख़ात्मा, इज़्ज़त की शुरुआत</h4>
                    <p className="text-sm">हमने उन मोटे commissions को काट दिया जो kitchens का दम निकाल रहे थे। जब financial extortion खत्म हुआ, तो chefs ने खाने की quality और quantity दोनों को दिल से बढ़ाना शुरू किया।</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</span>
                  <div>
                    <h4 className="font-bold text-foreground">Direct Delivery, कोई Hidden Games नहीं</h4>
                    <p className="text-sm">बड़ी tech companies algorithms से उन brands को आगे बढ़ाती हैं जो उन्हें ज़्यादा पैसे देते हैं। हमने ये खेल बंद किया। Chatori Jeeb पर हर उस kitchen को बराबर हक़ मिलता है जिसका स्वाद लाजवाब है।</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</span>
                  <div>
                    <h4 className="font-bold text-foreground">आपका पैसा, सही जगह</h4>
                    <p className="text-sm">जब आप Chatori Jeeb से order करते हैं, तो आपका पैसा किसी विदेशी investor की जेब में नहीं जाता, बल्कि उस local chef और उसके परिवार के पास जाता है जो आपके लिए दिल से खाना बना रहा है।</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-3xl p-8 text-center border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">आज का सच</h3>
              <p className="text-lg leading-relaxed mb-4">
                Chatori Jeeb आज सिर्फ एक software ya delivery app नहीं है। ये एक ऐसी <strong className="text-primary-deep">क्रांति (movement)</strong> है जो उन बेबस हाथों को ताकत देने के लिए बनी है जो सुबह से शाम तक आपके स्वाद के लिए मेहनत करते हैं।
              </p>
              <p className="text-lg leading-relaxed">
                हम बड़ी online delivery giants की तरह शोर नहीं मचाते, पर जब आपकी plate तक खाना पहुंचाते हैं, तो उसमें स्वाद के साथ-साथ एक परिवार की दुआ और मुस्कान भी शामिल होती है।
              </p>
              <div className="mt-6 p-4 bg-white/80 rounded-xl border border-primary/30">
                <p className="text-xl font-bold text-primary-deep italic">
                  "क्योंकि खाने पर हक़ सच्चे बनाने वाले और खाने वाले का होना चाहिए, <u>बीच वाले का नहीं!</u>"
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Mission, Vision, Story Pillars */}
      <section aria-labelledby="pillars" className="mb-16">
        <h2 id="pillars" className="text-2xl md:text-3xl font-extrabold text-center mb-8">
          {isHindi ? "हमारे स्तंभ" : "Our Pillars"}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map(({ Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-elegant transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section aria-labelledby="stats" className="mb-16">
        <h2 id="stats" className="text-2xl md:text-3xl font-extrabold text-center mb-8">
          {isHindi ? "हमारा प्रभाव" : "Our Impact So Far"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-gradient-warm border border-border p-6 text-center">
              <Icon className="h-6 w-6 mx-auto text-primary-deep" />
              <div className="mt-3 text-4xl font-extrabold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-primary/10 via-orange-50 to-primary/10 rounded-3xl p-12 border border-border">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
          {isHindi ? "क्या आप भी हमारे साथ हैं?" : "Join the Revolution"}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          {isHindi
            ? "हर ऑर्डर के साथ, आप स्थानीय kitchens और उनके परिवारों का समर्थन कर रहे हैं। Chatori Jeeb के साथ स्वाद का अधिकार वापस लें।"
            : "With every order, you're supporting local kitchens and their families. Take back the right to authentic taste with Chatori Jeeb."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/download" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-deep text-white rounded-xl font-semibold hover:bg-primary transition-colors">
            {isHindi ? "अभी डाउनलोड करें" : "Download Now"}
          </a>
          <a href="/restaurant" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground border border-border rounded-xl font-semibold hover:bg-muted transition-colors">
            {isHindi ? "Restaurant के लिए" : "For Restaurants"}
          </a>
        </div>
      </section>
    </CompanyLayout>
  );
};

export default About;
