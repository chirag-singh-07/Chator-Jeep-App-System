import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin } from "lucide-react";

const easeApple = [0.16, 1, 0.3, 1] as const;

/**
 * Coordinates projected from real lat/lng to a 1000x1100 SVG viewBox
 * (lon 68°E–98°E → x 0–1000, lat 37°N–6°N → y 0–1100).
 * The India outline path uses the same projection so markers land correctly.
 */
const cities = [
  { name: "Mumbai", x: 162.6, y: 636.0, partners: "320+" },
  { name: "Delhi", x: 307.0, y: 297.6, partners: "280+" },
  { name: "Bengaluru", x: 319.8, y: 852.6, partners: "210+" },
  { name: "Hyderabad", x: 349.6, y: 696.0, partners: "150+" },
  { name: "Chennai", x: 409.0, y: 848.7, partners: "140+" },
  { name: "Pune", x: 195.2, y: 655.7, partners: "120+" },
  { name: "Kolkata", x: 678.8, y: 511.9, partners: "100+" },
  { name: "Ahmedabad", x: 152.4, y: 496.0, partners: "90+" },
  { name: "Jaipur", x: 259.6, y: 357.9, partners: "80+" },
  { name: "Lucknow", x: 431.5, y: 360.3, partners: "75+" },
];

/**
 * Simplified India outline traced through real geographic anchor points
 * and projected with the same lon/lat → x/y formula as the city markers.
 * Order: Kashmir → Punjab/Haryana → Gujarat (Kutch) → west coast → Kanyakumari
 * → east coast → Odisha → Bengal → NE states → Himalayas back to Kashmir.
 */
const INDIA_PATH =
  "M 230,160 L 270,180 L 310,200 L 360,230 L 400,250 L 430,270 L 460,290 " +
  "L 470,330 L 450,370 L 410,400 L 360,440 L 290,470 L 220,490 L 160,510 " +
  "L 130,540 L 140,580 L 170,620 L 200,660 L 230,710 L 270,770 L 310,830 " +
  "L 340,890 L 370,940 L 395,975 L 405,955 L 415,910 L 430,860 L 455,810 " +
  "L 480,760 L 510,700 L 545,640 L 580,580 L 620,540 L 660,510 L 700,490 " +
  "L 740,475 L 770,490 L 760,530 L 740,565 L 750,600 L 790,615 L 830,605 " +
  "L 855,580 L 870,545 L 895,520 L 925,505 L 950,495 L 935,460 L 905,440 " +
  "L 870,425 L 830,420 L 800,410 L 770,395 L 740,375 L 710,355 L 680,335 " +
  "L 640,315 L 600,295 L 555,275 L 510,250 L 460,225 L 410,205 L 360,195 " +
  "L 320,180 L 280,165 Z";

export const Coverage = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="coverage" className="py-24 md:py-32 bg-gradient-warm overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: easeApple }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary-deep">Pan-India</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Now serving 50+ cities</h2>
          <p className="mt-4 text-muted-foreground text-lg">Coming to a street near you. Tap a marker to see partner counts.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Real India SVG map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: easeApple }}
            className="lg:col-span-2 relative aspect-[10/11] rounded-3xl bg-card border border-border shadow-card overflow-hidden"
          >
            {/* Subtle dotted grid background */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(var(--primary-deep)) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            <svg
              viewBox="0 0 1000 1100"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Map of India showing Chatori Jeeb service cities"
              role="img"
            >
              <defs>
                <linearGradient id="indiaFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(48 100% 88%)" />
                  <stop offset="100%" stopColor="hsl(45 100% 78%)" />
                </linearGradient>
                <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* India outline */}
              <motion.path
                d={INDIA_PATH}
                fill="url(#indiaFill)"
                stroke="hsl(45 100% 51%)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: easeApple }}
              />

              {/* Connection lines (delivery network) */}
              <g stroke="hsl(45 100% 51%)" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" fill="none">
                {[
                  [0, 1], [0, 5], [1, 8], [1, 9], [2, 3], [2, 4], [3, 4], [9, 6],
                ].map(([a, b], i) => (
                  <motion.line
                    key={i}
                    x1={cities[a].x}
                    y1={cities[a].y}
                    x2={cities[b].x}
                    y2={cities[b].y}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 1.4 + i * 0.08, ease: easeApple }}
                  />
                ))}
              </g>

              {/* City markers */}
              {cities.map((c, i) => {
                const isActive = active === i;
                return (
                  <motion.g
                    key={c.name}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 1.6 + i * 0.08, ease: easeApple }}
                    style={{ transformOrigin: `${c.x}px ${c.y}px`, transformBox: "fill-box" }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="cursor-pointer focus:outline-none"
                    tabIndex={0}
                    aria-label={`${c.name}, ${c.partners} delivery partners`}
                  >
                    {/* Pulsing halo */}
                    <circle cx={c.x} cy={c.y} r="14" fill="hsl(45 100% 51%)" opacity="0.25">
                      <animate
                        attributeName="r"
                        values="10;22;10"
                        dur="2.4s"
                        begin={`${i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.35;0;0.35"
                        dur="2.4s"
                        begin={`${i * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Marker dot */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isActive ? 11 : 8}
                      fill="hsl(45 100% 51%)"
                      stroke="white"
                      strokeWidth="2.5"
                      filter="url(#markerGlow)"
                      style={{ transition: "r 300ms cubic-bezier(0.16,1,0.3,1)" }}
                    />
                  </motion.g>
                );
              })}

              {/* Tooltip */}
              {active !== null && (
                <g
                  style={{
                    transform: `translate(${cities[active].x}px, ${cities[active].y - 28}px)`,
                  }}
                >
                  <foreignObject x="-90" y="-60" width="180" height="56" style={{ overflow: "visible" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: easeApple }}
                      className="mx-auto inline-flex flex-col items-center px-3 py-2 rounded-xl bg-foreground text-background text-xs font-semibold shadow-glow whitespace-nowrap"
                      style={{ width: "fit-content" }}
                    >
                      <span>{cities[active].name}</span>
                      <span className="text-[10px] font-normal opacity-80 mt-0.5">
                        {cities[active].partners} delivery partners
                      </span>
                    </motion.div>
                  </foreignObject>
                </g>
              )}
            </svg>
          </motion.div>

          {/* Synced city list */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((c, i) => {
                const isActive = active === i;
                return (
                  <motion.button
                    key={c.name}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: easeApple }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-left transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-glow -translate-y-0.5"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <MapPin
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive ? "text-primary-foreground" : "text-primary-deep"
                      }`}
                    />
                    <span className="flex-1">{c.name}</span>
                    <span className={`text-[10px] ${isActive ? "opacity-90" : "text-muted-foreground"}`}>
                      {c.partners}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">+ 40 more cities expanding monthly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
