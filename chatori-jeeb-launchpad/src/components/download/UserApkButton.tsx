import { Download, ShieldCheck } from "lucide-react";

export const USER_APK_URL = "/downloads/main-user.apk";
export const USER_APK_SIZE = "83.4 MB";

type Props = {
  className?: string;
  compact?: boolean;
};

export const UserApkButton = ({ className = "", compact = false }: Props) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <a
        href={USER_APK_URL}
        download="main-user.apk"
        aria-label="Download Chatori Jeeb user app APK"
        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-primary px-5 py-3 text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-elegant"
      >
        <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-85">
            Direct APK
          </span>
          <span className="block text-base font-extrabold">
            Download User App
          </span>
        </span>
      </a>
      {!compact && (
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary-deep" />
          Android APK, {USER_APK_SIZE}. Install only from this official Chatori Jeeb website.
        </div>
      )}
    </div>
  );
};
