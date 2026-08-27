export type PartnerTemplateCategory =
  | "BUSY_HOUR"
  | "LUNCH_PEAK"
  | "DINNER_PEAK"
  | "RAINY_WEATHER"
  | "INCENTIVE"
  | "OFF_DUTY_NUDGE"
  | "MORNING_START";

export interface PartnerNotifTemplate {
  id: string;
  category: PartnerTemplateCategory;
  englishTitle: string;
  englishBody: string;
  hinglishTitle: string;
  hinglishBody: string;
  /** Importance multiplier (1.0 = normal, higher = more frequent) */
  weight: number;
  /** Minimum hour (IST 0-23) this makes sense to send */
  minHour: number;
  /** Maximum hour (IST 0-24) this makes sense to send */
  maxHour: number;
  /** Per-template cooldown in hours before this exact template can be sent again */
  cooldownHours: number;
  /** Whether this template is currently in rotation */
  isActive: boolean;
  /** Screen to navigate to when tapped */
  screen: string;
}

export const PARTNER_NOTIFICATION_TEMPLATES: PartnerNotifTemplate[] = [
  // ─── OFF_DUTY_NUDGE (General nudges to come online) ─────────────────────
  {
    id: "partner_nudge_1",
    category: "OFF_DUTY_NUDGE",
    englishTitle: "Ready to hit the road? 🛵",
    englishBody: "Orders are starting to pick up. Go online to start earning now!",
    hinglishTitle: "Road par nikalne ke liye ready? 🛵",
    hinglishBody: "Orders aana start ho gaye hain. Online aao aur kamai shuru karo!",
    weight: 1.0,
    minHour: 8,
    maxHour: 22,
    cooldownHours: 48,
    isActive: true,
    screen: "Home",
  },
  {
    id: "partner_nudge_2",
    category: "OFF_DUTY_NUDGE",
    englishTitle: "Your bike is missing you! 🏍️",
    englishBody: "Turn your app online and get your first delivery for the day.",
    hinglishTitle: "Aapki bike aapko miss kar rahi hai! 🏍️",
    hinglishBody: "App ko online karo aur din ka pehla order uthao.",
    weight: 1.0,
    minHour: 8,
    maxHour: 20,
    cooldownHours: 48,
    isActive: true,
    screen: "Home",
  },

  // ─── LUNCH_PEAK ──────────────────────────────────────────────────────────
  {
    id: "partner_lunch_1",
    category: "LUNCH_PEAK",
    englishTitle: "Lunch Rush is Here! 🍱",
    englishBody: "High demand right now. Go online for back-to-back orders.",
    hinglishTitle: "Lunch Rush aagaya! 🍱",
    hinglishBody: "Abhi demand high hai. Back-to-back orders ke liye online aao.",
    weight: 2.0,
    minHour: 11,
    maxHour: 15,
    cooldownHours: 24,
    isActive: true,
    screen: "Home",
  },

  // ─── DINNER_PEAK ─────────────────────────────────────────────────────────
  {
    id: "partner_dinner_1",
    category: "DINNER_PEAK",
    englishTitle: "Dinner Rush Alert! 🍽️",
    englishBody: "Everyone's ordering dinner. This is the best time to maximize your earnings!",
    hinglishTitle: "Dinner Rush! 🍽️",
    hinglishBody: "Sab dinner order kar rahe hain. Kamai badhane ka sabse sahi time!",
    weight: 2.0,
    minHour: 18,
    maxHour: 22,
    cooldownHours: 24,
    isActive: true,
    screen: "Home",
  },

  // ─── BUSY_HOUR (General High Demand) ──────────────────────────────────────
  {
    id: "partner_busy_1",
    category: "BUSY_HOUR",
    englishTitle: "Surge in your area! 🚀",
    englishBody: "Demand is high in your zone right now. Go online and grab the orders.",
    hinglishTitle: "Aapke area me surge hai! 🚀",
    hinglishBody: "Demand high hai. Online aao aur orders pick karo.",
    weight: 1.5,
    minHour: 9,
    maxHour: 23,
    cooldownHours: 24,
    isActive: true,
    screen: "Home",
  },

  // ─── RAINY_WEATHER ────────────────────────────────────────────────────────
  {
    id: "partner_rain_1",
    category: "RAINY_WEATHER",
    englishTitle: "Rain = More Orders 🌧️",
    englishBody: "Stay safe and earn extra during this rainy weather. Customers are waiting!",
    hinglishTitle: "Barish = Zyada Orders 🌧️",
    hinglishBody: "Safe raho aur barish me extra kamao. Customers wait kar rahe hain!",
    weight: 1.5,
    minHour: 8,
    maxHour: 23,
    cooldownHours: 72,
    isActive: true,
    screen: "Home",
  },

  // ─── MORNING_START ────────────────────────────────────────────────────────
  {
    id: "partner_morning_1",
    category: "MORNING_START",
    englishTitle: "Good Morning Champion! ☀️",
    englishBody: "Start your day early and hit your daily goals faster.",
    hinglishTitle: "Good Morning Champion! ☀️",
    hinglishBody: "Din ki shuruwat jaldi karo aur apna target jaldi poora karo.",
    weight: 1.2,
    minHour: 7,
    maxHour: 10,
    cooldownHours: 48,
    isActive: true,
    screen: "Home",
  },
];

export const getActivePartnerTemplateCount = () =>
  PARTNER_NOTIFICATION_TEMPLATES.filter((t) => t.isActive).length;
