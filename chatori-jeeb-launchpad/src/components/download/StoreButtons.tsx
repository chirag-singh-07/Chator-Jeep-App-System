import { Apple, Play } from "lucide-react";

type Props = { className?: string; align?: "start" | "center" };

export const StoreButtons = ({ className = "", align = "start" }: Props) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${align === "center" ? "justify-center" : ""} ${className}`}>
      <a
        href="#"
        aria-label="Download on the App Store"
        className="group inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-5 py-3 hover:scale-[1.03] transition-transform shadow-soft"
      >
        <Apple className="h-6 w-6" />
        <div className="text-left leading-tight">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Download on the</div>
          <div className="text-base font-bold">App Store</div>
        </div>
      </a>
      <a
        href="#"
        aria-label="Get it on Google Play"
        className="group inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-5 py-3 hover:scale-[1.03] transition-transform shadow-soft"
      >
        <Play className="h-6 w-6" />
        <div className="text-left leading-tight">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Get it on</div>
          <div className="text-base font-bold">Google Play</div>
        </div>
      </a>
    </div>
  );
};