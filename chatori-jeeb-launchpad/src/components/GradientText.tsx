import { ReactNode } from "react";

export const GradientText = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span
    className={className}
    style={{
      backgroundImage: "linear-gradient(135deg, hsl(48 100% 55%), hsl(38 100% 45%))",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    }}
  >
    {children}
  </span>
);
