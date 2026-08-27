import { NotificationEvent } from "./notification-event.model";
import {
  PARTNER_NOTIFICATION_TEMPLATES,
  PartnerNotifTemplate,
  PartnerTemplateCategory,
  getActivePartnerTemplateCount,
} from "./partner-templates-library";
import { notifConfig } from "./notification.config";
import { TimeSlot } from "./template-selector";

/** Get current IST hour (0-23) */
const getISTHour = (): number => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).getUTCHours();
};

const getTimeSlot = (hour: number): TimeSlot => {
  if (hour >= 6 && hour < 11) return "MORNING";
  if (hour >= 11 && hour < 15) return "LUNCH";
  if (hour >= 15 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 21) return "EVENING";
  if (hour >= 21 && hour < 24) return "NIGHT";
  return "LATE_NIGHT";
};

const PARTNER_TIME_SLOT_WEIGHTS: Record<TimeSlot, Record<PartnerTemplateCategory, number>> = {
  MORNING: {
    MORNING_START: 3.0,
    BUSY_HOUR: 1.5,
    INCENTIVE: 1.2,
    OFF_DUTY_NUDGE: 1.5,
    RAINY_WEATHER: 1.0,
    LUNCH_PEAK: 0.1,
    DINNER_PEAK: 0,
  },
  LUNCH: {
    LUNCH_PEAK: 3.0,
    BUSY_HOUR: 2.0,
    OFF_DUTY_NUDGE: 1.5,
    INCENTIVE: 1.5,
    RAINY_WEATHER: 1.0,
    MORNING_START: 0.1,
    DINNER_PEAK: 0.1,
  },
  AFTERNOON: {
    BUSY_HOUR: 2.0,
    INCENTIVE: 1.5,
    OFF_DUTY_NUDGE: 1.2,
    RAINY_WEATHER: 1.0,
    LUNCH_PEAK: 0.2,
    DINNER_PEAK: 0.5,
    MORNING_START: 0,
  },
  EVENING: {
    DINNER_PEAK: 3.0,
    BUSY_HOUR: 2.5,
    INCENTIVE: 2.0,
    OFF_DUTY_NUDGE: 1.8,
    RAINY_WEATHER: 1.2,
    LUNCH_PEAK: 0,
    MORNING_START: 0,
  },
  NIGHT: {
    BUSY_HOUR: 2.0,
    INCENTIVE: 1.5,
    OFF_DUTY_NUDGE: 1.5,
    RAINY_WEATHER: 1.0,
    DINNER_PEAK: 1.5,
    LUNCH_PEAK: 0,
    MORNING_START: 0,
  },
  LATE_NIGHT: {
    BUSY_HOUR: 1.5,
    OFF_DUTY_NUDGE: 1.0,
    INCENTIVE: 1.0,
    RAINY_WEATHER: 0.8,
    DINNER_PEAK: 0.2,
    LUNCH_PEAK: 0,
    MORNING_START: 0,
  },
};

const getRecentlySentTemplateIds = async (
  userId: string, // This is partner's userId
  cooldownDays: number
): Promise<Set<string>> => {
  const cutoff = new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000);

  const recent = await NotificationEvent.find({
    userId,
    userType: "PARTNER",
    status: "SENT",
    sentAt: { $gte: cutoff },
    templateId: { $ne: null, $exists: true },
    type: { $nin: [
      "ORDER_ASSIGNED", "DELIVERY_ASSIGNED", "ORDER_DELIVERED",
    ]},
  }).select("templateId").lean<Array<{ templateId?: string }>>();

  const ids = new Set<string>();
  for (const event of recent) {
    if (event.templateId) ids.add(event.templateId);
  }
  return ids;
};

const weightedRandom = (items: Array<{ template: PartnerNotifTemplate; effectiveWeight: number }>): PartnerNotifTemplate | null => {
  if (items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.effectiveWeight, 0);
  if (totalWeight <= 0) return items[Math.floor(Math.random() * items.length)].template;

  let rand = Math.random() * totalWeight;
  for (const item of items) {
    rand -= item.effectiveWeight;
    if (rand <= 0) return item.template;
  }
  return items[items.length - 1].template;
};

export interface SelectedPartnerTemplate {
  templateId: string;
  title: string;
  body: string;
  type: string;
  language: "en" | "hi";
  screen: string;
  category: string;
}

export const selectPartnerTemplate = async (
  userId: string,
  preferredLanguage?: "en" | "hi"
): Promise<SelectedPartnerTemplate | null> => {
  const hour = getISTHour();
  const slot = getTimeSlot(hour);
  const slotWeights = PARTNER_TIME_SLOT_WEIGHTS[slot];
  const cooldownDays = notifConfig.templateCooldownDays;

  const hourEligible = PARTNER_NOTIFICATION_TEMPLATES.filter(
    (t) => t.isActive && hour >= t.minHour && hour < (t.maxHour === 24 ? 25 : t.maxHour)
  );

  if (hourEligible.length === 0) {
    console.log(`[PartnerTemplateSelector] ⚠️  No templates eligible at hour ${hour}`);
    return null;
  }

  let recentIds: Set<string>;
  try {
    recentIds = await getRecentlySentTemplateIds(userId, cooldownDays);
  } catch {
    recentIds = new Set();
  }

  const availableTemplates = hourEligible.filter((t) => !recentIds.has(t.id));

  const pool = availableTemplates.length > 0 ? availableTemplates : hourEligible;
  const usingFallback = availableTemplates.length === 0;

  if (usingFallback) {
    console.log(`[PartnerTemplateSelector] ♻️  All templates on cooldown — using full pool for partner user ${userId}`);
  }

  const weighted = pool.map((t) => {
    const slotMultiplier = slotWeights[t.category] ?? 1.0;
    const cooldownBoost = usingFallback && recentIds.has(t.id) ? 0.3 : 1.0;
    return {
      template: t,
      effectiveWeight: t.weight * slotMultiplier * cooldownBoost,
    };
  }).filter((item) => item.effectiveWeight > 0);

  if (weighted.length === 0) {
    console.log(`[PartnerTemplateSelector] ⚠️  All templates have 0 weight at slot ${slot}`);
    return null;
  }

  const selected = weightedRandom(weighted);
  if (!selected) return null;

  const language: "en" | "hi" = preferredLanguage ?? (Math.random() < 0.5 ? "en" : "hi");

  const title = language === "hi" ? selected.hinglishTitle : selected.englishTitle;
  const body = language === "hi" ? selected.hinglishBody : selected.englishBody;

  console.log(
    `[PartnerTemplateSelector] 🎯 Selected: "${selected.id}" | cat: ${selected.category} | slot: ${slot} | lang: ${language} | pool: ${pool.length}/${PARTNER_NOTIFICATION_TEMPLATES.filter(t=>t.isActive).length} templates`
  );

  return {
    templateId: selected.id,
    title,
    body,
    type: selected.category,
    language,
    screen: selected.screen,
    category: selected.category,
  };
};

export { getActivePartnerTemplateCount };
