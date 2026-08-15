/**
 * Smart Template Selector
 *
 * Implements the full context-aware, weighted, cooldown-respecting
 * notification template selection algorithm.
 *
 * Selection pipeline:
 *   Time-of-day context
 *       ↓
 *   Category scoring (primary + secondary)
 *       ↓
 *   Filter by hour window eligibility
 *       ↓
 *   Remove recently-sent templates (per-user cooldown)
 *       ↓
 *   Weighted random selection
 *       ↓
 *   Language selection (user preference or random)
 *       ↓
 *   Return { title, body, templateId, type, language }
 */

import { NotificationEvent } from "./notification-event.model";
import {
  NOTIFICATION_TEMPLATES,
  NotifTemplate,
  TemplateCategory,
  getActiveTemplateCount,
} from "./notification-templates-library";
import { notifConfig } from "./notification.config";

// ─── Time Context ──────────────────────────────────────────────────────────────

export type TimeSlot =
  | "MORNING"        // 6-11
  | "LUNCH"          // 11-15
  | "AFTERNOON"      // 15-18
  | "EVENING"        // 18-21
  | "NIGHT"          // 21-23
  | "LATE_NIGHT";    // 23-6

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

/**
 * Category priority map per time slot.
 * Primary = most preferred; Secondary = acceptable; Tertiary = allowed but low priority.
 * Any category not listed gets a base weight multiplier of 1×.
 */
const TIME_SLOT_WEIGHTS: Record<TimeSlot, Record<TemplateCategory, number>> = {
  MORNING: {
    BREAKFAST: 3.0,
    WORK_BREAK: 1.5,
    FOOD_DISCOVERY: 1.2,
    FUN_CONVERSATIONAL: 1.2,
    // everything else
    LUNCH: 0.3,
    DINNER: 0.1,
    MIDNIGHT_CRAVINGS: 0,
    LATE_NIGHT: 0,
    MOVIE_NIGHT: 0.2,
    CRAVINGS: 0.8,
    EVENING_SNACK: 0.3,
    GAMING: 0.5,
    STUDY_BREAK: 1.0,
    FRIENDS: 0.5,
    FAMILY: 0.8,
    WEEKEND: 1.2,
    RAINY_WEATHER: 1.0,
    HOT_WEATHER: 0.5,
    SPORTS: 0.5,
    PARTY: 0.2,
    LAZY_DAY: 0.8,
    SELF_TREAT: 0.6,
    RE_ENGAGEMENT: 0.8,
  },
  LUNCH: {
    LUNCH: 3.0,
    CRAVINGS: 2.0,
    WORK_BREAK: 2.0,
    FOOD_DISCOVERY: 1.5,
    FUN_CONVERSATIONAL: 1.5,
    STUDY_BREAK: 1.5,
    FRIENDS: 1.2,
    SELF_TREAT: 1.0,
    BREAKFAST: 0.2,
    DINNER: 0.2,
    EVENING_SNACK: 0.5,
    MIDNIGHT_CRAVINGS: 0,
    LATE_NIGHT: 0,
    MOVIE_NIGHT: 0.3,
    GAMING: 0.8,
    FAMILY: 0.8,
    WEEKEND: 1.0,
    RAINY_WEATHER: 1.0,
    HOT_WEATHER: 1.0,
    SPORTS: 0.5,
    PARTY: 0.5,
    LAZY_DAY: 0.8,
    RE_ENGAGEMENT: 0.8,
  },
  AFTERNOON: {
    EVENING_SNACK: 3.0,
    CRAVINGS: 2.0,
    WORK_BREAK: 1.8,
    STUDY_BREAK: 1.8,
    FRIENDS: 1.5,
    FUN_CONVERSATIONAL: 1.5,
    GAMING: 1.5,
    FOOD_DISCOVERY: 1.3,
    SPORTS: 1.3,
    SELF_TREAT: 1.2,
    BREAKFAST: 0.1,
    DINNER: 0.5,
    MIDNIGHT_CRAVINGS: 0,
    LATE_NIGHT: 0,
    LUNCH: 0.5,
    MOVIE_NIGHT: 0.5,
    FAMILY: 1.0,
    WEEKEND: 1.2,
    RAINY_WEATHER: 1.2,
    HOT_WEATHER: 1.3,
    PARTY: 0.8,
    LAZY_DAY: 1.0,
    RE_ENGAGEMENT: 0.8,
  },
  EVENING: {
    DINNER: 3.0,
    MOVIE_NIGHT: 2.5,
    FAMILY: 2.0,
    FRIENDS: 2.0,
    SELF_TREAT: 1.8,
    CRAVINGS: 1.5,
    EVENING_SNACK: 1.5,
    SPORTS: 1.5,
    PARTY: 1.5,
    FUN_CONVERSATIONAL: 1.3,
    GAMING: 1.3,
    FOOD_DISCOVERY: 1.2,
    WEEKEND: 1.5,
    RAINY_WEATHER: 1.5,
    LAZY_DAY: 1.0,
    RE_ENGAGEMENT: 1.0,
    BREAKFAST: 0,
    MIDNIGHT_CRAVINGS: 0.3,
    LATE_NIGHT: 0.3,
    LUNCH: 0.2,
    STUDY_BREAK: 0.8,
    WORK_BREAK: 0.5,
    HOT_WEATHER: 0.8,
  },
  NIGHT: {
    MOVIE_NIGHT: 3.0,
    GAMING: 2.5,
    MIDNIGHT_CRAVINGS: 2.0,
    LATE_NIGHT: 2.0,
    DINNER: 1.5,
    CRAVINGS: 1.5,
    SELF_TREAT: 1.3,
    FRIENDS: 1.3,
    FUN_CONVERSATIONAL: 1.2,
    FOOD_DISCOVERY: 0.8,
    RAINY_WEATHER: 1.0,
    RE_ENGAGEMENT: 0.8,
    BREAKFAST: 0,
    LUNCH: 0.1,
    EVENING_SNACK: 0.5,
    WORK_BREAK: 0.3,
    STUDY_BREAK: 1.0,
    FAMILY: 1.2,
    PARTY: 1.5,
    WEEKEND: 1.0,
    SPORTS: 0.8,
    HOT_WEATHER: 0.5,
    LAZY_DAY: 1.0,
  },
  LATE_NIGHT: {
    MIDNIGHT_CRAVINGS: 3.0,
    LATE_NIGHT: 3.0,
    MOVIE_NIGHT: 2.0,
    GAMING: 2.0,
    CRAVINGS: 1.5,
    FUN_CONVERSATIONAL: 1.2,
    BREAKFAST: 0,
    LUNCH: 0,
    DINNER: 0.5,
    EVENING_SNACK: 0.3,
    WORK_BREAK: 0,
    STUDY_BREAK: 1.0,
    FRIENDS: 1.0,
    FAMILY: 0.5,
    WEEKEND: 0.8,
    RAINY_WEATHER: 0.8,
    HOT_WEATHER: 0.3,
    SPORTS: 0.5,
    PARTY: 1.2,
    LAZY_DAY: 0.8,
    SELF_TREAT: 0.8,
    FOOD_DISCOVERY: 0.5,
    RE_ENGAGEMENT: 0.5,
  },
};

// ─── Cooldown Tracking ─────────────────────────────────────────────────────────

/**
 * Get template IDs sent to a user within the per-template cooldown window.
 * Returns a Set<templateId> for O(1) lookup.
 *
 * Uses the indexed top-level `templateId` field stored in NotificationEvent
 * (not data.templateId) for efficient querying.
 */
const getRecentlySentTemplateIds = async (
  userId: string,
  cooldownDays: number
): Promise<Set<string>> => {
  const cutoff = new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000);

  const recent = await NotificationEvent.find({
    userId,
    status: "SENT",
    sentAt: { $gte: cutoff },
    templateId: { $ne: null, $exists: true },
    // Exclude order lifecycle notifications — only check engagement ones
    type: { $nin: [
      "ORDER_PLACED", "ORDER_ACCEPTED", "ORDER_PREPARING", "ORDER_READY",
      "ORDER_OUT_FOR_DELIVERY", "ORDER_DELIVERED", "ORDER_CANCELLED",
      "PAYMENT_CONFIRMED", "REFUND_PROCESSED",
    ]},
  }).select("templateId").lean<Array<{ templateId?: string }>>();

  const ids = new Set<string>();
  for (const event of recent) {
    if (event.templateId) ids.add(event.templateId);
  }
  return ids;
};

// ─── Weighted Random Selection ────────────────────────────────────────────────

/**
 * Weighted reservoir sample — picks one item with probability proportional to weight.
 */
const weightedRandom = (items: Array<{ template: NotifTemplate; effectiveWeight: number }>): NotifTemplate | null => {
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

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SelectedTemplate {
  templateId: string;
  title: string;
  body: string;
  type: string;
  language: "en" | "hi";
  screen: string;
  category: string;
}

/**
 * Select the best notification template for a user at the current time.
 *
 * @param userId - For cooldown lookups (recently sent templates)
 * @param preferredLanguage - If set, overrides random language selection
 * @returns SelectedTemplate or null if no eligible template found
 */
export const selectTemplate = async (
  userId: string,
  preferredLanguage?: "en" | "hi"
): Promise<SelectedTemplate | null> => {
  const hour = getISTHour();
  const slot = getTimeSlot(hour);
  const slotWeights = TIME_SLOT_WEIGHTS[slot];
  const cooldownDays = notifConfig.templateCooldownDays;

  // Step 1: Filter templates eligible at this hour
  const hourEligible = NOTIFICATION_TEMPLATES.filter(
    (t) => t.isActive && hour >= t.minHour && hour < (t.maxHour === 24 ? 25 : t.maxHour)
  );

  if (hourEligible.length === 0) {
    console.log(`[TemplateSelector] ⚠️  No templates eligible at hour ${hour}`);
    return null;
  }

  // Step 2: Get recently-sent template IDs to enforce cooldown
  let recentIds: Set<string>;
  try {
    recentIds = await getRecentlySentTemplateIds(userId, cooldownDays);
  } catch {
    recentIds = new Set(); // Non-fatal — if query fails, skip cooldown filter
  }

  // Step 3: Filter out recently-used templates (per their individual cooldown)
  // A template is blocked if it was recently sent AND its cooldown hasn't expired
  const now = Date.now();
  const availableTemplates = hourEligible.filter((t) => {
    if (!recentIds.has(t.id)) return true;
    // Template was recently sent — check if its specific cooldown has passed
    // (recentIds only contains IDs within cooldownDays, but each template has its own cooldown)
    // Since we only have the sent date from DB query scope, use template's cooldownHours
    // Templates in recentIds were sent within `cooldownDays` days — if cooldownHours is
    // shorter than cooldownDays * 24, we apply the template's own cooldownHours.
    // Simplification: if it's in recentIds, it's blocked (the query already uses cooldownDays).
    return false;
  });

  // If all templates are on cooldown, fall back to all hour-eligible templates
  // (better to repeat than send nothing)
  const pool = availableTemplates.length > 0 ? availableTemplates : hourEligible;
  const usingFallback = availableTemplates.length === 0;

  if (usingFallback) {
    console.log(`[TemplateSelector] ♻️  All templates on cooldown — using full pool for user ${userId}`);
  }

  // Step 4: Apply time-slot weights to each template
  const weighted = pool.map((t) => {
    const slotMultiplier = slotWeights[t.category] ?? 1.0;
    // Boost templates NOT recently used (only matters in fallback mode)
    const cooldownBoost = usingFallback && recentIds.has(t.id) ? 0.3 : 1.0;
    return {
      template: t,
      effectiveWeight: t.weight * slotMultiplier * cooldownBoost,
    };
  }).filter((item) => item.effectiveWeight > 0);

  if (weighted.length === 0) {
    console.log(`[TemplateSelector] ⚠️  All templates have 0 weight at slot ${slot}`);
    return null;
  }

  // Step 5: Weighted random selection
  const selected = weightedRandom(weighted);
  if (!selected) return null;

  // Step 6: Language selection
  // Priority: user preference → random
  const language: "en" | "hi" = preferredLanguage ?? (Math.random() < 0.5 ? "en" : "hi");

  const title = language === "hi" ? selected.hinglishTitle : selected.englishTitle;
  const body = language === "hi" ? selected.hinglishBody : selected.englishBody;

  console.log(
    `[TemplateSelector] 🎯 Selected: "${selected.id}" | cat: ${selected.category} | slot: ${slot} | lang: ${language} | pool: ${pool.length}/${NOTIFICATION_TEMPLATES.filter(t=>t.isActive).length} templates`
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

/** Convenience for startup logging */
export { getActiveTemplateCount };
