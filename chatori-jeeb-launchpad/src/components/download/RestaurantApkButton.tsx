import { Download, ShieldCheck } from "lucide-react";

export const RESTAURANT_APK_URL = "/downloads/chatori-jeeb-restaurant-app.apk";
export const RESTAURANT_APK_SIZE = "84.8 MB";

type Props = {
  className?: string;
  compact?: boolean;
};

export const RestaurantApkButton = ({ className = "", compact = false }: Props) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <a
        href={RESTAURANT_APK_URL}
        download="chatori-jeeb-restaurant-app.apk"
        aria-label="Download Chatori Jeeb Restaurant App APK"
        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-primary px-5 py-3 text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-elegant"
      >
        <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-85">
            Direct APK
          </span>
          <span className="block text-base font-extrabold">
            Download Restaurant App
          </span>
        </span>
      </a>
      {!compact && (
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary-deep" />
          Android APK, {RESTAURANT_APK_SIZE}. Install only from this official Chatori Jeeb website.
        </div>
      )}
    </div>
  );
};
