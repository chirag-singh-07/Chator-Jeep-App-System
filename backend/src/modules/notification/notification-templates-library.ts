/**
 * Notification Template Library — 60+ predefined engagement templates.
 *
 * Architecture:
 * - Static in code (not DB) — templates are content, not data
 * - Easy to add new templates without touching any other file
 * - Each template has full metadata for context-aware smart selection
 *
 * To add a new template:
 *   1. Add a new object to NOTIFICATION_TEMPLATES array
 *   2. Give it a unique `id`
 *   3. Set appropriate category, time window, weight, cooldown
 *   4. Done — the selector picks it up automatically
 */

export type TemplateCategory =
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER"
  | "EVENING_SNACK"
  | "MIDNIGHT_CRAVINGS"
  | "CRAVINGS"
  | "MOVIE_NIGHT"
  | "GAMING"
  | "STUDY_BREAK"
  | "WORK_BREAK"
  | "FRIENDS"
  | "FAMILY"
  | "WEEKEND"
  | "RAINY_WEATHER"
  | "HOT_WEATHER"
  | "SPORTS"
  | "PARTY"
  | "LAZY_DAY"
  | "SELF_TREAT"
  | "FOOD_DISCOVERY"
  | "RE_ENGAGEMENT"
  | "FUN_CONVERSATIONAL"
  | "LATE_NIGHT";

export interface NotifTemplate {
  /** Unique identifier — used for cooldown tracking */
  id: string;
  category: TemplateCategory;
  englishTitle: string;
  englishBody: string;
  hinglishTitle: string;
  hinglishBody: string;
  /**
   * Relative weight — higher weight = selected more often.
   * Default 10. Use 5 for niche templates, 15 for universally popular ones.
   */
  weight: number;
  /**
   * Hour window (IST, 24h). Template only eligible during this range.
   * 0-23. Use 0/23 for "anytime".
   */
  minHour: number;
  maxHour: number;
  /**
   * How many hours must pass before this specific template
   * can be sent to the SAME user again.
   * Default: 24 hours (once per day). Use 168 for once per week.
   */
  cooldownHours: number;
  /** Deep-link screen sent in push data */
  screen: "home" | "restaurants" | "orders" | "offers";
  isActive: boolean;
}

// ─── Template Library ──────────────────────────────────────────────────────────

export const NOTIFICATION_TEMPLATES: NotifTemplate[] = [

  // ── BREAKFAST (6 AM – 11 AM) ────────────────────────────────────────────────

  {
    id: "breakfast_01",
    category: "BREAKFAST",
    englishTitle: "🌅 Good morning!",
    englishBody: "Start your day right with a fresh, delicious breakfast. Delivered to your door!",
    hinglishTitle: "🌅 Good morning!",
    hinglishBody: "Subah ka shuruaat karo sahi tarike se — ghar pe fresh breakfast mangwao!",
    weight: 12, minHour: 6, maxHour: 11, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "breakfast_02",
    category: "BREAKFAST",
    englishTitle: "☕ Morning fuel?",
    englishBody: "Nothing beats a hot breakfast to kick off the day. What are we having this morning?",
    hinglishTitle: "☕ Subah ka boost?",
    hinglishBody: "Din ki shuruaat ke liye kuch garam nashta toh chahiye. Aaj kya mangwa rahe ho?",
    weight: 10, minHour: 6, maxHour: 11, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "breakfast_03",
    category: "BREAKFAST",
    englishTitle: "🍳 Skip the kitchen today!",
    englishBody: "Let someone else do the cooking this morning. Fresh breakfast, zero effort.",
    hinglishTitle: "🍳 Aaj kitchen band karo!",
    hinglishBody: "Aaj khud pakane ki zaroorat nahi. Garam nashta ghar pe order karo!",
    weight: 10, minHour: 6, maxHour: 11, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── LUNCH (11 AM – 3 PM) ────────────────────────────────────────────────────

  {
    id: "lunch_01",
    category: "LUNCH",
    englishTitle: "🍱 Lunch time!",
    englishBody: "Hungry? Your favourite restaurant is just a tap away. Order lunch now!",
    hinglishTitle: "🍱 Lunch ka time ho gaya!",
    hinglishBody: "Bhook lagi? Favourite restaurant bas ek tap door hai. Abhi order karo!",
    weight: 15, minHour: 11, maxHour: 15, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "lunch_02",
    category: "LUNCH",
    englishTitle: "🌮 What's for lunch today?",
    englishBody: "Biryani, pizza, or a healthy bowl? Whatever you're craving, we've got it!",
    hinglishTitle: "🌮 Aaj lunch mein kya?",
    hinglishBody: "Biryani, pizza, ya kuch healthy? Jo bhi man kare, sab available hai!",
    weight: 14, minHour: 11, maxHour: 15, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "lunch_03",
    category: "LUNCH",
    englishTitle: "🍔 Lunchtime craving!",
    englishBody: "That 1 PM hunger just hit, didn't it? We felt it too. Order now!",
    hinglishTitle: "🍔 Dopahar ki craving!",
    hinglishBody: "1 baje wali bhook shuru ho gayi na? Hum samajhte hain. Abhi order karo!",
    weight: 13, minHour: 12, maxHour: 14, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "lunch_04",
    category: "LUNCH",
    englishTitle: "🥗 Power up for the afternoon!",
    englishBody: "A good lunch = a productive afternoon. Don't skip it — order something delicious!",
    hinglishTitle: "🥗 Dopahar ke liye energy lao!",
    hinglishBody: "Accha lunch = productive afternoon. Skip mat karo — kuch tasty order karo!",
    weight: 10, minHour: 12, maxHour: 15, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── EVENING SNACK (3 PM – 7 PM) ─────────────────────────────────────────────

  {
    id: "evening_snack_01",
    category: "EVENING_SNACK",
    englishTitle: "🌆 Evening cravings kicking in?",
    englishBody: "We know the feeling. Something crispy and hot? Coming right up!",
    hinglishTitle: "🌆 Shaam ki cravings shuru?",
    hinglishBody: "Hum samajhte hain yaar! Kuch crispy aur garam? Abhi mangwao!",
    weight: 14, minHour: 15, maxHour: 19, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "evening_snack_02",
    category: "EVENING_SNACK",
    englishTitle: "☕ Tea time snack?",
    englishBody: "Samosas, momos, or a cold coffee? Pick your perfect evening combo!",
    hinglishTitle: "☕ Chai ke saath kuch?",
    hinglishBody: "Samose, momos ya cold coffee? Apna perfect shaam ka combo chunao!",
    weight: 13, minHour: 15, maxHour: 18, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "evening_snack_03",
    category: "EVENING_SNACK",
    englishTitle: "🧁 A little treat for you!",
    englishBody: "You've been doing great today. How about a sweet little snack as a reward?",
    hinglishTitle: "🧁 Thoda reward toh banta hai!",
    hinglishBody: "Aaj aapne bahut kaam kiya. Khud ko ek sweet snack se reward karo!",
    weight: 10, minHour: 15, maxHour: 19, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "evening_snack_04",
    category: "EVENING_SNACK",
    englishTitle: "🍟 4 PM hunger is real!",
    englishBody: "The afternoon slump hits different. Fuel up with your favourite snack.",
    hinglishTitle: "🍟 4 baje ki bhook real hai!",
    hinglishBody: "Dopahar ke baad ki slump alag hi hoti hai. Favourite snack se energy le lo!",
    weight: 12, minHour: 15, maxHour: 17, cooldownHours: 24, screen: "home", isActive: true,
  },

  // ── DINNER (6 PM – 10 PM) ───────────────────────────────────────────────────

  {
    id: "dinner_01",
    category: "DINNER",
    englishTitle: "🍽️ Dinner time!",
    englishBody: "Your next favourite meal could be just a tap away. What's for dinner tonight?",
    hinglishTitle: "🍽️ Dinner ka time ho gaya!",
    hinglishBody: "Aapka next favourite dinner bas ek tap door hai. Aaj raat kya mangwao ge?",
    weight: 15, minHour: 18, maxHour: 22, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "dinner_02",
    category: "DINNER",
    englishTitle: "🌙 Skip the cooking tonight!",
    englishBody: "You cooked enough this week. Tonight, let the pros handle it.",
    hinglishTitle: "🌙 Aaj khana mat pakao!",
    hinglishBody: "Is hafte bahut pakaya. Aaj raat pros ko karne do — order karo!",
    weight: 14, minHour: 18, maxHour: 22, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "dinner_03",
    category: "DINNER",
    englishTitle: "🍛 Comfort food calling?",
    englishBody: "Nothing fixes a long day like great food. Order your favourites now.",
    hinglishTitle: "🍛 Comfort food ka call aa gaya?",
    hinglishBody: "Lamba din ho gaya? Achha khana sab theek kar deta hai. Favourite order karo!",
    weight: 13, minHour: 19, maxHour: 22, cooldownHours: 24, screen: "home", isActive: true,
  },

  // ── MOVIE NIGHT (7 PM – 1 AM) ───────────────────────────────────────────────

  {
    id: "movie_night_01",
    category: "MOVIE_NIGHT",
    englishTitle: "🍿 Movie time?",
    englishBody: "Watching a movie? Get your popcorn and make movie night even better!",
    hinglishTitle: "🍿 Movie dekh rahe ho?",
    hinglishBody: "Movie dekh rahe ho? Popcorn mangwa lo aur movie night ko aur bhi mast bana do!",
    weight: 15, minHour: 19, maxHour: 24, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "movie_night_02",
    category: "MOVIE_NIGHT",
    englishTitle: "🎬 Movie + food = perfect night!",
    englishBody: "No movie night is complete without great snacks. Order now, it arrives fast!",
    hinglishTitle: "🎬 Movie + khana = perfect raat!",
    hinglishBody: "Movie night bina snacks ke adhoori hai! Abhi order karo, jaldi aa jayega!",
    weight: 14, minHour: 19, maxHour: 24, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "movie_night_03",
    category: "MOVIE_NIGHT",
    englishTitle: "📺 Binge night essentials?",
    englishBody: "Series marathon in progress? Make sure your snack supply doesn't run out!",
    hinglishTitle: "📺 Binge night ke liye ready?",
    hinglishBody: "Web series chal rahi hai? Snack supply khatam mat hone dena!",
    weight: 13, minHour: 20, maxHour: 24, cooldownHours: 72, screen: "home", isActive: true,
  },

  // ── GAMING (Any time, more common evening/night) ─────────────────────────────

  {
    id: "gaming_01",
    category: "GAMING",
    englishTitle: "🎮 Game on?",
    englishBody: "Don't let hunger interrupt your winning streak. Order now and keep playing!",
    hinglishTitle: "🎮 Game on hai?",
    hinglishBody: "Bhook ko apni winning streak kharab mat karne do! Order karo aur khelte raho!",
    weight: 13, minHour: 14, maxHour: 24, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "gaming_02",
    category: "GAMING",
    englishTitle: "🕹️ Pro gamers eat too!",
    englishBody: "Your game's paused. Fill up fast and get back to winning!",
    hinglishTitle: "🕹️ Pro gamers bhi khate hain!",
    hinglishBody: "Game paused hai. Jaldi kha lo aur wapas aao — victory wait kar rahi hai!",
    weight: 11, minHour: 14, maxHour: 24, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "gaming_03",
    category: "GAMING",
    englishTitle: "⚡ Fuel your game session!",
    englishBody: "Hours of gaming need serious fuel. Get something tasty and keep going!",
    hinglishTitle: "⚡ Game session ke liye fuel lo!",
    hinglishBody: "Ghanton ka gaming session serious fuel maangta hai. Kuch tasty order karo!",
    weight: 10, minHour: 16, maxHour: 24, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── STUDY BREAK ─────────────────────────────────────────────────────────────

  {
    id: "study_break_01",
    category: "STUDY_BREAK",
    englishTitle: "📚 Study break?",
    englishBody: "You've been studying hard. Take a tasty break — you deserve it!",
    hinglishTitle: "📚 Padhai se break?",
    hinglishBody: "Itni padhai ho gayi, ek tasty break toh banta hai!",
    weight: 12, minHour: 10, maxHour: 22, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "study_break_02",
    category: "STUDY_BREAK",
    englishTitle: "🧠 Brain food incoming!",
    englishBody: "Smart students take smart breaks. Order something yummy and recharge!",
    hinglishTitle: "🧠 Brain food aa raha hai!",
    hinglishBody: "Smart students smart breaks lete hain! Kuch yummy order karo aur recharge ho jao!",
    weight: 11, minHour: 10, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "study_break_03",
    category: "STUDY_BREAK",
    englishTitle: "✏️ Exam season survival!",
    englishBody: "You can't study on an empty stomach. Fuel up and get back to it!",
    hinglishTitle: "✏️ Exam season survival!",
    hinglishBody: "Khali pet padhai nahi hoti yaar! Kha lo aur phir laut aao!",
    weight: 10, minHour: 10, maxHour: 23, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── WORK BREAK ──────────────────────────────────────────────────────────────

  {
    id: "work_break_01",
    category: "WORK_BREAK",
    englishTitle: "💻 Been working for hours?",
    englishBody: "Time for a delicious little break. Your deadlines can wait 30 minutes!",
    hinglishTitle: "💻 Kaafi der se kaam kar rahe ho?",
    hinglishBody: "Ek tasty break toh banta hai! Deadlines 30 minute wait kar sakti hain!",
    weight: 13, minHour: 10, maxHour: 19, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "work_break_02",
    category: "WORK_BREAK",
    englishTitle: "☕ Lunch break loading...",
    englishBody: "Step away from the screen. A good meal makes you 10x more productive!",
    hinglishTitle: "☕ Lunch break loading...",
    hinglishBody: "Screen se thoda door jao. Achha khana productivity 10x badha deta hai!",
    weight: 12, minHour: 12, maxHour: 15, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "work_break_03",
    category: "WORK_BREAK",
    englishTitle: "🖥️ Meeting marathon done?",
    englishBody: "Back-to-back meetings are exhausting. Treat yourself to something great!",
    hinglishTitle: "🖥️ Meeting marathon khatam?",
    hinglishBody: "Back-to-back meetings thaka deti hain. Khud ko kuch tasty se treat karo!",
    weight: 10, minHour: 12, maxHour: 19, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── FRIENDS ──────────────────────────────────────────────────────────────────

  {
    id: "friends_01",
    category: "FRIENDS",
    englishTitle: "👯 Friends coming over?",
    englishBody: "Food makes every hangout better. Order for the whole squad!",
    hinglishTitle: "👯 Friends aa rahe hain?",
    hinglishBody: "Good food ke bina hangout kaise complete hoga! Poore squad ke liye order karo!",
    weight: 12, minHour: 12, maxHour: 23, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "friends_02",
    category: "FRIENDS",
    englishTitle: "🎉 Hangout plans?",
    englishBody: "Make your friends session even better with some amazing food. Order together!",
    hinglishTitle: "🎉 Hangout plans hain?",
    hinglishBody: "Yaar logo ke saath fun aur bhi badh jaata hai acche khaane ke saath!",
    weight: 11, minHour: 14, maxHour: 23, cooldownHours: 96, screen: "home", isActive: true,
  },
  {
    id: "friends_03",
    category: "FRIENDS",
    englishTitle: "🍕 Pizza + friends = best combo!",
    englishBody: "Calling your crew? Don't forget to call for food too!",
    hinglishTitle: "🍕 Pizza + dost = best combo!",
    hinglishBody: "Friends ko call kar rahe ho? Khaane ko bhi call karna mat bhoolo!",
    weight: 10, minHour: 16, maxHour: 23, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── FAMILY ───────────────────────────────────────────────────────────────────

  {
    id: "family_01",
    category: "FAMILY",
    englishTitle: "👨‍👩‍👧‍👦 Family dinner made easy!",
    englishBody: "Feed the whole family without the hassle. Order everyone's favourites!",
    hinglishTitle: "👨‍👩‍👧‍👦 Family dinner easy ho gaya!",
    hinglishBody: "Poore ghar ke liye bina jhanjhat ke khana mangwao. Sab ki favourites ek jagah!",
    weight: 12, minHour: 18, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "family_02",
    category: "FAMILY",
    englishTitle: "🏠 Family Sunday sorted?",
    englishBody: "Sundays are for family, not cooking. Let us handle the food today!",
    hinglishTitle: "🏠 Family Sunday sort ho gaya?",
    hinglishBody: "Sunday family ke liye hai, cooking ke liye nahi! Aaj khana humpe chodo!",
    weight: 11, minHour: 11, maxHour: 21, cooldownHours: 72, screen: "home", isActive: true,
  },

  // ── WEEKEND ──────────────────────────────────────────────────────────────────

  {
    id: "weekend_01",
    category: "WEEKEND",
    englishTitle: "😌 It's the weekend!",
    englishBody: "Cooking can wait. Treat yourself and enjoy your well-earned break!",
    hinglishTitle: "😌 Weekend hai boss!",
    hinglishBody: "Cooking baad mein, aaj kuch tasty order kar lo! Aapne ye deserve kiya hai!",
    weight: 14, minHour: 9, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "weekend_02",
    category: "WEEKEND",
    englishTitle: "🎊 Weekend vibes!",
    englishBody: "No alarms, no rush — just great food and good times. Order now!",
    hinglishTitle: "🎊 Weekend vibes!",
    hinglishBody: "No alarm, no rush — sirf achha khana aur accha time. Order karo!",
    weight: 13, minHour: 10, maxHour: 22, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "weekend_03",
    category: "WEEKEND",
    englishTitle: "☀️ Weekend, you deserve better!",
    englishBody: "You worked hard all week. This weekend, someone else is cooking for you!",
    hinglishTitle: "☀️ Weekend pe better deserve karte ho!",
    hinglishBody: "Poora hafta mehnat ki. Is weekend pe koi aur pakayega tere liye!",
    weight: 12, minHour: 10, maxHour: 21, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── RAINY WEATHER ────────────────────────────────────────────────────────────

  {
    id: "rainy_01",
    category: "RAINY_WEATHER",
    englishTitle: "🌧️ Perfect weather for hot food!",
    englishBody: "It's raining outside. Stay in and order something hot and delicious!",
    hinglishTitle: "🌧️ Baarish mein garam khana!",
    hinglishBody: "Bahar baarish ho rahi hai. Ghar pe raho aur kuch garma-garam order karo!",
    weight: 14, minHour: 7, maxHour: 22, cooldownHours: 12, screen: "home", isActive: true,
  },
  {
    id: "rainy_02",
    category: "RAINY_WEATHER",
    englishTitle: "☔ Rainy day comfort food!",
    englishBody: "Pakodas, hot soup, or masala chai — rainy days deserve comfort food!",
    hinglishTitle: "☔ Baarish aur comfort food!",
    hinglishBody: "Pakode, garam soup ya masala chai — baarish ke din comfort food toh banta hai!",
    weight: 13, minHour: 7, maxHour: 22, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "rainy_03",
    category: "RAINY_WEATHER",
    englishTitle: "🌧️ Don't go out in the rain!",
    englishBody: "Stay cozy, we'll deliver your food right to your door. Rain proof!",
    hinglishTitle: "🌧️ Baarish mein bahar mat jao!",
    hinglishBody: "Ghar pe aaram karo, hum khaana pahuncha denge. Rain proof delivery!",
    weight: 12, minHour: 7, maxHour: 21, cooldownHours: 24, screen: "home", isActive: true,
  },

  // ── HOT WEATHER ──────────────────────────────────────────────────────────────

  {
    id: "hot_weather_01",
    category: "HOT_WEATHER",
    englishTitle: "☀️ Staying cool indoors?",
    englishBody: "Smart move! Get refreshing food and cold drinks delivered to you.",
    hinglishTitle: "☀️ Andar cool ho rahe ho?",
    hinglishBody: "Samajhdaari ki baat hai! Refreshing khana aur thandi drinks ghar pe mangwao.",
    weight: 12, minHour: 11, maxHour: 19, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "hot_weather_02",
    category: "HOT_WEATHER",
    englishTitle: "🥵 Too hot to cook?",
    englishBody: "We don't blame you. Cool off with some great food delivered fast!",
    hinglishTitle: "🥵 Itni garmi mein pakana mushkil hai!",
    hinglishBody: "Hum samajhte hain! Thanda raho aur ghar pe khana mangwao!",
    weight: 11, minHour: 11, maxHour: 18, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── SPORTS ───────────────────────────────────────────────────────────────────

  {
    id: "sports_01",
    category: "SPORTS",
    englishTitle: "⚽ Match day snacks!",
    englishBody: "Big game tonight? Make it more exciting with great food for the whole crowd!",
    hinglishTitle: "⚽ Match day snacks!",
    hinglishBody: "Aaj match hai? Poore group ke liye tasty khana order karo aur maza double karo!",
    weight: 12, minHour: 15, maxHour: 23, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "sports_02",
    category: "SPORTS",
    englishTitle: "🏏 Cricket + biryani = life!",
    englishBody: "Watching cricket? A good biryani makes every over better!",
    hinglishTitle: "🏏 Cricket + biryani = life!",
    hinglishBody: "Cricket dekh rahe ho? Ek achhi biryani har over ko aur mast bana deti hai!",
    weight: 11, minHour: 15, maxHour: 23, cooldownHours: 72, screen: "home", isActive: true,
  },

  // ── PARTY ────────────────────────────────────────────────────────────────────

  {
    id: "party_01",
    category: "PARTY",
    englishTitle: "🎉 Party planning?",
    englishBody: "No party is complete without great food. Order for the whole group!",
    hinglishTitle: "🎉 Party plan ho raha hai?",
    hinglishBody: "Bina achhe khaane ke party adhoori hai! Poore group ke liye order karo!",
    weight: 11, minHour: 16, maxHour: 24, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "party_02",
    category: "PARTY",
    englishTitle: "🥂 Hosting tonight?",
    englishBody: "Impress your guests without spending hours in the kitchen. Order party food!",
    hinglishTitle: "🥂 Aaj host kar rahe ho?",
    hinglishBody: "Guests impress karo bina kitchen mein ghante guzaare. Party food order karo!",
    weight: 10, minHour: 16, maxHour: 24, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── LAZY DAY ─────────────────────────────────────────────────────────────────

  {
    id: "lazy_day_01",
    category: "LAZY_DAY",
    englishTitle: "🛋️ Lazy day plans?",
    englishBody: "Stay on the couch. We'll bring the food to you. Maximum comfort!",
    hinglishTitle: "🛋️ Aaj lazy day hai?",
    hinglishBody: "Sofe pe hi baithe raho. Hum khaana la denge. Maximum comfort!",
    weight: 13, minHour: 10, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "lazy_day_02",
    category: "LAZY_DAY",
    englishTitle: "😴 Too comfy to cook?",
    englishBody: "Blanket too warm to leave? Totally understandable. Order from right here!",
    hinglishTitle: "😴 Rajai se nikalna mushkil hai?",
    hinglishBody: "Rajai bahut warm hai, bahar nikalna mushkil? Hum samajhte hain! Yaheen se order karo!",
    weight: 12, minHour: 10, maxHour: 22, cooldownHours: 72, screen: "home", isActive: true,
  },

  // ── SELF TREAT ───────────────────────────────────────────────────────────────

  {
    id: "self_treat_01",
    category: "SELF_TREAT",
    englishTitle: "❤️ Treat yourself today!",
    englishBody: "You worked hard today. You deserve something truly delicious. Go on!",
    hinglishTitle: "❤️ Aaj khud ko treat karo!",
    hinglishBody: "Aaj bahut mehnat ki hai. Khud ko kuch truly tasty se treat karo!",
    weight: 13, minHour: 12, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "self_treat_02",
    category: "SELF_TREAT",
    englishTitle: "🌟 You deserve the best!",
    englishBody: "Good food is self-care. Pick your favourite and enjoy every bite!",
    hinglishTitle: "🌟 Aap best deserve karte ho!",
    hinglishBody: "Achha khana bhi self-care hai. Favourite order karo aur har bite enjoy karo!",
    weight: 11, minHour: 12, maxHour: 22, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "self_treat_03",
    category: "SELF_TREAT",
    englishTitle: "🎁 A gift from you to you!",
    englishBody: "No occasion needed. Order something special just because you can!",
    hinglishTitle: "🎁 Khud ko gift karo!",
    hinglishBody: "Koi khaas wajah nahi chahiye. Sirf apne liye kuch special order karo!",
    weight: 10, minHour: 12, maxHour: 22, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── FOOD DISCOVERY ───────────────────────────────────────────────────────────

  {
    id: "food_discovery_01",
    category: "FOOD_DISCOVERY",
    englishTitle: "👀 Feeling adventurous?",
    englishBody: "Try something new today! There's always a new favourite waiting to be discovered.",
    hinglishTitle: "👀 Aaj kuch naya try karne ka mood?",
    hinglishBody: "Kuch different order karo! Ek naya favourite aapka intezaar kar raha hai.",
    weight: 13, minHour: 10, maxHour: 22, cooldownHours: 48, screen: "restaurants", isActive: true,
  },
  {
    id: "food_discovery_02",
    category: "FOOD_DISCOVERY",
    englishTitle: "🍔 Your next fave might be nearby!",
    englishBody: "You haven't tried everything yet. Explore restaurants near you!",
    hinglishTitle: "🍔 Next favourite bilkul nearby ho sakta hai!",
    hinglishBody: "Abhi bhi bahut kuch try karna baaki hai. Aas paas ki restaurants explore karo!",
    weight: 12, minHour: 10, maxHour: 22, cooldownHours: 48, screen: "restaurants", isActive: true,
  },
  {
    id: "food_discovery_03",
    category: "FOOD_DISCOVERY",
    englishTitle: "🌟 New restaurants near you!",
    englishBody: "Fresh, local restaurants have joined us. Explore something new today!",
    hinglishTitle: "🌟 Nayi restaurants paas mein!",
    hinglishBody: "Nayi local restaurants join ho gayi hain. Aaj kuch naya explore karo!",
    weight: 11, minHour: 10, maxHour: 21, cooldownHours: 72, screen: "restaurants", isActive: true,
  },
  {
    id: "food_discovery_04",
    category: "FOOD_DISCOVERY",
    englishTitle: "🗺️ Explore local flavours!",
    englishBody: "The best local eateries are right at your fingertips. Discover them now!",
    hinglishTitle: "🗺️ Local flavours explore karo!",
    hinglishBody: "Sabse acchi local eateries aapke haath mein hain. Abhi discover karo!",
    weight: 10, minHour: 11, maxHour: 21, cooldownHours: 96, screen: "restaurants", isActive: true,
  },

  // ── RE-ENGAGEMENT ────────────────────────────────────────────────────────────

  {
    id: "re_engagement_01",
    category: "RE_ENGAGEMENT",
    englishTitle: "🚀 We miss you!",
    englishBody: "Come back and enjoy amazing deals from your favourite restaurants. 50% OFF today!",
    hinglishTitle: "🚀 Aapki yaad aa rahi thi!",
    hinglishBody: "Wapas aao aur favourite restaurants ke amazing deals enjoy karo. Aaj 50% OFF!",
    weight: 11, minHour: 10, maxHour: 21, cooldownHours: 72, screen: "offers", isActive: true,
  },
  {
    id: "re_engagement_02",
    category: "RE_ENGAGEMENT",
    englishTitle: "💥 Special offer just for you!",
    englishBody: "Exclusive discount waiting! Use CHATORI50 for FLAT 50% off your next order.",
    hinglishTitle: "💥 Sirf aapke liye special offer!",
    hinglishBody: "Exclusive discount wait kar raha hai! CHATORI50 use karo FLAT 50% off ke liye.",
    weight: 10, minHour: 10, maxHour: 21, cooldownHours: 96, screen: "offers", isActive: true,
  },
  {
    id: "re_engagement_03",
    category: "RE_ENGAGEMENT",
    englishTitle: "👋 Still thinking?",
    englishBody: "Your favourite restaurants are still here. Great food, fast delivery — always!",
    hinglishTitle: "👋 Abhi bhi soch rahe ho?",
    hinglishBody: "Aapke favourite restaurants abhi bhi yahan hain. Tasty khana, fast delivery — hamesha!",
    weight: 10, minHour: 11, maxHour: 21, cooldownHours: 120, screen: "home", isActive: true,
  },

  // ── FUN / CONVERSATIONAL ─────────────────────────────────────────────────────

  {
    id: "fun_01",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "🤔 Important question!",
    englishBody: "What are we eating today? The stomach committee demands an answer.",
    hinglishTitle: "🤔 Ek important sawaal!",
    hinglishBody: "Aaj kya khane wale ho? Pet committee ka jawab chahiye!",
    weight: 13, minHour: 10, maxHour: 21, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "fun_02",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "😋 Your stomach called!",
    englishBody: "It says it wants something delicious. We're just the messenger.",
    hinglishTitle: "😋 Pet ne call kiya hai!",
    hinglishBody: "Bol raha hai kuch tasty chahiye. Hum toh sirf messenger hain!",
    weight: 13, minHour: 10, maxHour: 21, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "fun_03",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "👀 We already know...",
    englishBody: "We won't even ask if you're hungry. Just open the app and let's go!",
    hinglishTitle: "👀 Humein pata hai...",
    hinglishBody: "Bhook lagi hai ya nahi, poochne ki zaroorat nahi. Bas app kholo aur shuru karo!",
    weight: 12, minHour: 11, maxHour: 21, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "fun_04",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "🍕 Pizza is always the answer.",
    englishBody: "Whatever the question is. Trust us on this one.",
    hinglishTitle: "🍕 Pizza hamesha sahi answer hai.",
    hinglishBody: "Chahe sawaal kuch bhi ho. Humpe yakeen karo.",
    weight: 11, minHour: 12, maxHour: 22, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "fun_05",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "😤 Your stomach: Order. Now.",
    englishBody: "Your stomach is not asking anymore. It's telling you.",
    hinglishTitle: "😤 Pet: Abhi. Order. Karo.",
    hinglishBody: "Pet ab request nahi kar raha. Direct command de raha hai.",
    weight: 11, minHour: 11, maxHour: 21, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "fun_06",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "🫶 You + good food = happiness!",
    englishBody: "Simple maths. Order something great today!",
    hinglishTitle: "🫶 Tum + achha khana = khushi!",
    hinglishBody: "Simple maths hai. Aaj kuch great order karo!",
    weight: 10, minHour: 11, maxHour: 21, cooldownHours: 72, screen: "home", isActive: true,
  },
  {
    id: "fun_07",
    category: "FUN_CONVERSATIONAL",
    englishTitle: "🎯 Life goal: Eat great food.",
    englishBody: "You're doing amazing. Keep it up — starting with lunch!",
    hinglishTitle: "🎯 Life goal: Achha khana khao.",
    hinglishBody: "Aap bahut achha kar rahe ho. Aur achha karo — lunch se shuru karo!",
    weight: 10, minHour: 11, maxHour: 15, cooldownHours: 96, screen: "home", isActive: true,
  },

  // ── CRAVINGS (General) ───────────────────────────────────────────────────────

  {
    id: "cravings_01",
    category: "CRAVINGS",
    englishTitle: "🌶️ Craving something spicy?",
    englishBody: "We've got all the spicy dishes your heart desires. Order now!",
    hinglishTitle: "🌶️ Kuch teekha khane ka mann hai?",
    hinglishBody: "Jo bhi teekha dish chahiye — sab available hai. Abhi order karo!",
    weight: 12, minHour: 11, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "cravings_02",
    category: "CRAVINGS",
    englishTitle: "🍜 Comfort food o'clock!",
    englishBody: "Whatever you're craving right now — we've got it. Tap and order!",
    hinglishTitle: "🍜 Comfort food time!",
    hinglishBody: "Jo bhi craving ho abhi — sab milega. Tap karo aur order karo!",
    weight: 12, minHour: 11, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "cravings_03",
    category: "CRAVINGS",
    englishTitle: "🤤 That craving is real!",
    englishBody: "We see you staring into space thinking about food. Just order it!",
    hinglishTitle: "🤤 Wo craving bilkul real hai!",
    hinglishBody: "Hum jaante hain aap khane ke baare mein soch rahe ho. Bas order kar do!",
    weight: 11, minHour: 12, maxHour: 21, cooldownHours: 48, screen: "home", isActive: true,
  },
  {
    id: "cravings_04",
    category: "CRAVINGS",
    englishTitle: "🍩 Sweet tooth calling?",
    englishBody: "Desserts, mithai, or a cold coffee — satisfy your sweet craving right now!",
    hinglishTitle: "🍩 Meetha khane ka mann hai?",
    hinglishBody: "Desserts, mithai ya cold coffee — abhi meetha craving satisfy karo!",
    weight: 10, minHour: 14, maxHour: 22, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── MIDNIGHT CRAVINGS / LATE NIGHT ───────────────────────────────────────────

  {
    id: "midnight_01",
    category: "MIDNIGHT_CRAVINGS",
    englishTitle: "🌙 Late-night cravings?",
    englishBody: "Your kitchen isn't the only option. We've got late-night delivery covered!",
    hinglishTitle: "🌙 Late-night cravings ho rahi hain?",
    hinglishBody: "Kitchen ke alawa bhi options hain! Late-night delivery available hai!",
    weight: 12, minHour: 22, maxHour: 24, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "midnight_02",
    category: "MIDNIGHT_CRAVINGS",
    englishTitle: "🌚 Night owl hungry?",
    englishBody: "Up late? The best late-night food is just a tap away. Order now!",
    hinglishTitle: "🌚 Raatwale bhookhe hain?",
    hinglishBody: "Raat ko jaag rahe ho? Sabse achha late-night khana bas ek tap door hai!",
    weight: 11, minHour: 22, maxHour: 24, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "midnight_03",
    category: "MIDNIGHT_CRAVINGS",
    englishTitle: "🌙 Midnight munchies solved!",
    englishBody: "Stop raiding the fridge. Let us bring something actually good to you!",
    hinglishTitle: "🌙 Midnight munchies solve ho gaye!",
    hinglishBody: "Fridge raid karna band karo. Hum kuch actually accha la denge!",
    weight: 10, minHour: 22, maxHour: 24, cooldownHours: 48, screen: "home", isActive: true,
  },

  // ── LATE NIGHT (10 PM – midnight) ────────────────────────────────────────────

  {
    id: "late_night_01",
    category: "LATE_NIGHT",
    englishTitle: "🌙 Still up?",
    englishBody: "Late nights get better with great food. Order something delicious!",
    hinglishTitle: "🌙 Abhi bhi jaag rahe ho?",
    hinglishBody: "Raat aur bhi achhi hoti hai achhe khaane ke saath. Kuch order karo!",
    weight: 12, minHour: 21, maxHour: 24, cooldownHours: 24, screen: "home", isActive: true,
  },
  {
    id: "late_night_02",
    category: "LATE_NIGHT",
    englishTitle: "💫 End the day deliciously!",
    englishBody: "Whatever your day was like, a great meal makes everything better.",
    hinglishTitle: "💫 Din ka end deliciously karo!",
    hinglishBody: "Din kaisa bhi raha ho, ek achha khana sab kuch better bana deta hai.",
    weight: 11, minHour: 21, maxHour: 23, cooldownHours: 48, screen: "home", isActive: true,
  },

];

// ─── Validation Helper ─────────────────────────────────────────────────────────

/** Returns count of active templates — useful for startup logs */
export const getActiveTemplateCount = (): number =>
  NOTIFICATION_TEMPLATES.filter((t) => t.isActive).length;

/** Get templates filtered by category */
export const getTemplatesByCategory = (category: TemplateCategory): NotifTemplate[] =>
  NOTIFICATION_TEMPLATES.filter((t) => t.isActive && t.category === category);
