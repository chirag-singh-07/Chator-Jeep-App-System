/**
 * Bilingual notification templates (English + Hinglish).
 *
 * Rules:
 * - Multiple variants per type to prevent repetition.
 * - Random variant selected at send time.
 * - Language selection: random for now (until app adds language preference UI).
 *   When preferredLanguage is set on User model, it will be respected.
 */

export type Language = "en" | "hi";

export interface NotifTemplate {
  title: string;
  body: string;
}

export interface BilingualTemplate {
  en: NotifTemplate[];
  hi: NotifTemplate[];
}

// ─── Order Lifecycle Templates ─────────────────────────────────────────────────

export const ORDER_PLACED_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🍔 Order Placed!",
      body: "Your order from {restaurantName} has been received. We're getting it ready for you!",
    },
    {
      title: "✅ Order Confirmed!",
      body: "Great news! {restaurantName} has received your order worth ₹{amount}. Hold tight!",
    },
  ],
  hi: [
    {
      title: "🍔 Order Place Ho Gaya!",
      body: "{restaurantName} se aapka order mil gaya hai. Ab hum ise ready kar rahe hain!",
    },
    {
      title: "✅ Order Confirm Ho Gaya!",
      body: "Waah! {restaurantName} ko aapka ₹{amount} ka order mil gaya. Thoda wait karein!",
    },
  ],
};

export const ORDER_ACCEPTED_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "👨‍🍳 Order Accepted!",
      body: "{restaurantName} has accepted your order and is preparing it now. Estimated 30 mins.",
    },
    {
      title: "🎉 Restaurant Confirmed!",
      body: "Your order from {restaurantName} is confirmed! The kitchen is on it.",
    },
  ],
  hi: [
    {
      title: "👨‍🍳 Order Accept Ho Gaya!",
      body: "{restaurantName} ne aapka order accept kar liya hai aur ab prepare kar rahe hain.",
    },
    {
      title: "🎉 Restaurant Ready!",
      body: "{restaurantName} aapka order bana raha hai. Abhi aata hai!",
    },
  ],
};

export const ORDER_PREPARING_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🔥 Preparing Your Food!",
      body: "The chef at {restaurantName} is cooking your delicious order right now. Almost there!",
    },
    {
      title: "🍳 Kitchen Is Busy!",
      body: "Your order from {restaurantName} is being freshly prepared with love. Won't be long!",
    },
  ],
  hi: [
    {
      title: "🔥 Aapka Khana Ban Raha Hai!",
      body: "{restaurantName} ka chef aapka order abhi bana raha hai. Bas thoda wait!",
    },
    {
      title: "🍳 Kitchen Mein Hai!",
      body: "Aapka food {restaurantName} mein freshly prepare ho raha hai. Jaldi aa jayega!",
    },
  ],
};

export const ORDER_READY_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "📦 Order Is Ready!",
      body: "Your food is packed and ready! A delivery partner will pick it up soon.",
    },
    {
      title: "✅ Packed & Ready to Go!",
      body: "Your delicious order from {restaurantName} is ready. Delivery is on the way!",
    },
  ],
  hi: [
    {
      title: "📦 Order Ready Hai!",
      body: "Aapka food pack ho gaya hai! Delivery partner abhi pick up karenge.",
    },
    {
      title: "✅ Pack Hogaya, Ab Aayega!",
      body: "{restaurantName} ka order ready hai. Delivery wala abhi niklega!",
    },
  ],
};

export const ORDER_OUT_FOR_DELIVERY_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🛵 Out for Delivery!",
      body: "Your food is on its way! Delivery partner is heading to your location.",
    },
    {
      title: "🚀 Your Order Is Coming!",
      body: "Hold on! Your meal from {restaurantName} is coming to you right now.",
    },
  ],
  hi: [
    {
      title: "🛵 Order Raste Mein Hai!",
      body: "Aapka food aa raha hai! Delivery partner aapki taraf nikal chuka hai.",
    },
    {
      title: "🚀 Aa Raha Hai Aapka Order!",
      body: "Ruko thoda! {restaurantName} ka khana abhi aapke paas pahunch raha hai.",
    },
  ],
};

export const ORDER_DELIVERED_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🎉 Order Delivered!",
      body: "Your food has been delivered! Hope you enjoy every bite. Please rate your experience!",
    },
    {
      title: "🍽️ Enjoy Your Meal!",
      body: "Your order from {restaurantName} has arrived. Bon Appétit! Don't forget to rate us.",
    },
  ],
  hi: [
    {
      title: "🎉 Order Deliver Ho Gaya!",
      body: "Aapka khana pahunch gaya! Hope aapko meal pasand aaye. Apna experience rate karna mat bhoolna!",
    },
    {
      title: "🍽️ Khaiye Maza Se!",
      body: "{restaurantName} ka order aa gaya. Khub enjoy karein! Aur hamein rate zaroor karein.",
    },
  ],
};

export const ORDER_CANCELLED_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "❌ Order Cancelled",
      body: "Your order #{orderNumber} has been cancelled. Tap to see more details or reorder.",
    },
    {
      title: "😔 Order Cancelled",
      body: "Sorry! Order #{orderNumber} was cancelled. You can reorder anytime from the app.",
    },
  ],
  hi: [
    {
      title: "❌ Order Cancel Ho Gaya",
      body: "Aapka order #{orderNumber} cancel ho gaya. Details dekhne ke liye tap karein.",
    },
    {
      title: "😔 Order Cancel",
      body: "Maafi chahte hain! Order #{orderNumber} cancel ho gaya. Aap fir se order kar sakte hain.",
    },
  ],
};

// ─── Periodic Engagement Templates (Time-Aware) ───────────────────────────────

export const FOOD_DISCOVERY_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🍕 Feeling Hungry?",
      body: "There are some delicious options waiting for you nearby. Order now!",
    },
    {
      title: "👀 What's Cooking Near You?",
      body: "Explore top-rated restaurants near you. Something tasty is always just a tap away!",
    },
    {
      title: "🌟 New Restaurants Near You!",
      body: "Check out the newest and most-loved spots for your next meal!",
    },
  ],
  hi: [
    {
      title: "🍕 Bhook Lagi Hai?",
      body: "Aapke nearby kuch tasty options aapka wait kar rahe hain. Abhi order karein!",
    },
    {
      title: "👀 Kya Ban Raha Hai Paas Mein?",
      body: "Top-rated restaurants dekho aapke aas paas. Kuch tasty bas ek tap door hai!",
    },
    {
      title: "🌟 Nayi Restaurants Aapke Paas!",
      body: "Naye aur sabse pasand kiye gaye jagah dekho apne agle khane ke liye!",
    },
  ],
};

export const LUNCH_REMINDER_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🍱 Lunch Time!",
      body: "What are you craving today? Order your favourite lunch in 30 mins. Use CHATORI50 for 50% off!",
    },
    {
      title: "🌮 Lunchtime Craving?",
      body: "Hot biryani, fresh rolls, or a cheesy pizza? Order lunch now and get it fast!",
    },
  ],
  hi: [
    {
      title: "🍱 Lunch Ka Time Ho Gaya!",
      body: "Aaj kya khane ka mood hai? 30 min mein favourite lunch order karein. CHATORI50 se 50% off pao!",
    },
    {
      title: "🌮 Lunch Time Cravings?",
      body: "Garam biryani, fresh rolls, ya cheesy pizza? Abhi order karo, jaldi aayega!",
    },
  ],
};

export const EVENING_CRAVING_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🌆 Evening Cravings Hit Different!",
      body: "Treat yourself to something delicious this evening. Crispy snacks? Cold drinks? We've got it!",
    },
    {
      title: "☕ Tea Time Snacks!",
      body: "Samosas, momos or a cold coffee? Order your evening snack now!",
    },
  ],
  hi: [
    {
      title: "🌆 Shaam Ki Cravings!",
      body: "Kuch tasty order kar lo shaam ko! Crispy snacks ya cold drinks — sab available hai!",
    },
    {
      title: "☕ Chai Time Snacks!",
      body: "Samose, momos ya cold coffee? Abhi apna shaam ka snack order karo!",
    },
  ],
};

export const DINNER_REMINDER_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "🍽️ Dinner Time!",
      body: "Your next favourite meal could be just a tap away. What's for dinner tonight?",
    },
    {
      title: "🌙 Dinner Plans?",
      body: "Skip the cooking tonight! Order a delicious dinner from top restaurants near you.",
    },
  ],
  hi: [
    {
      title: "🍽️ Dinner Ka Time Ho Gaya!",
      body: "Aapka favourite meal bas ek tap door hai. Aaj raat kya khayenge?",
    },
    {
      title: "🌙 Dinner Plans?",
      body: "Aaj khana mat banao! Top restaurants se swadisht dinner order karo.",
    },
  ],
};

export const RE_ENGAGEMENT_TEMPLATES: BilingualTemplate = {
  en: [
    {
      title: "👀 Feeling Hungry?",
      body: "Your favourite food is just a few taps away. Open the app and discover what's new!",
    },
    {
      title: "🚀 We Miss You!",
      body: "Come back and enjoy amazing deals from your favourite restaurants. 50% OFF today!",
    },
    {
      title: "💥 Special Offer Just for You!",
      body: "Exclusive discount waiting! Use CHATORI50 for FLAT 50% off on your next order.",
    },
  ],
  hi: [
    {
      title: "👀 Bhook Lagi?",
      body: "Aapka favourite food bas kuch taps door hai! App kholo aur nayi cheezein dekho!",
    },
    {
      title: "🚀 Aapki Yaad Aa Rahi Thi!",
      body: "Wapas aao aur apne favourite restaurants ke amazing deals enjoy karo. Aaj 50% OFF!",
    },
    {
      title: "💥 Sirf Aapke Liye Special Offer!",
      body: "Exclusive discount wait kar raha hai! CHATORI50 use karo FLAT 50% off pane ke liye.",
    },
  ],
};

// ─── Template Resolution Utilities ────────────────────────────────────────────

/**
 * Pick a random variant from a template array.
 */
const pickVariant = (variants: NotifTemplate[]): NotifTemplate => {
  return variants[Math.floor(Math.random() * variants.length)];
};

/**
 * Interpolate template variables.
 * Replaces {restaurantName}, {amount}, {orderNumber} etc.
 */
export const interpolate = (text: string, vars: Record<string, string | number>): string => {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
};

/**
 * Get a random bilingual template for order lifecycle events.
 * Language: random selection (en or hi).
 * When preferredLanguage is set on user, pass it in.
 */
export const getOrderTemplate = (
  templates: BilingualTemplate,
  vars: Record<string, string | number> = {},
  preferredLanguage?: "en" | "hi"
): { title: string; body: string; language: "en" | "hi" } => {
  const lang: Language = preferredLanguage ?? (Math.random() < 0.5 ? "en" : "hi");
  const variant = pickVariant(templates[lang]);
  return {
    title: interpolate(variant.title, vars),
    body: interpolate(variant.body, vars),
    language: lang,
  };
};

/**
 * Get context-aware periodic notification template based on current IST hour.
 */
export const getPeriodicTemplate = (
  preferredLanguage?: "en" | "hi"
): { title: string; body: string; language: "en" | "hi"; type: string } => {
  // Get IST hour (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + istOffset);
  const hour = istNow.getUTCHours();

  let templates: BilingualTemplate;
  let type: string;

  if (hour >= 11 && hour < 15) {
    templates = LUNCH_REMINDER_TEMPLATES;
    type = "LUNCH_REMINDER";
  } else if (hour >= 15 && hour < 19) {
    templates = EVENING_CRAVING_TEMPLATES;
    type = "EVENING_CRAVING";
  } else if (hour >= 19 && hour < 23) {
    templates = DINNER_REMINDER_TEMPLATES;
    type = "DINNER_REMINDER";
  } else if (hour >= 10 && hour < 11) {
    templates = FOOD_DISCOVERY_TEMPLATES;
    type = "FOOD_DISCOVERY";
  } else {
    // General re-engagement for non-slot hours (shouldn't normally hit during daytime window)
    templates = RE_ENGAGEMENT_TEMPLATES;
    type = "RE_ENGAGEMENT";
  }

  const { title, body, language } = getOrderTemplate(templates, {}, preferredLanguage);
  return { title, body, language, type };
};
