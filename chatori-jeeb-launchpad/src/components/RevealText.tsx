import { motion } from "framer-motion";
import { ReactNode } from "react";

const easeApple = [0.16, 1, 0.3, 1] as const;

/**
 * Word-by-word reveal with mask. Apple-style: slow, soft, no overshoot.
 */
export const RevealText = ({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) => {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: delay + i * 0.08, ease: easeApple }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

/** Soft fade + rise. Use for subtext, buttons, supporting blocks. */
export const SoftRise = ({
  children,
  delay = 0,
  y = 24,
  className = "",
  inView = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  inView?: boolean;
}) => {
  const animateProps = inView
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } }
    : { animate: { opacity: 1, y: 0 } };
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...animateProps}
      transition={{ duration: 0.9, delay, ease: easeApple }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const appleEase = easeApple;