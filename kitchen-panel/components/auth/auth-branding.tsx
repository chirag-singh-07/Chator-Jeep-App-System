import Image from "next/image";
import { IMAGES } from "@/lib/images";

export function AuthBranding() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-14 text-white h-full overflow-hidden select-none bg-black">
      {/* Background Image overlay (No negative z-index to prevent stacking issues) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src={IMAGES.hero.main}
          alt="Chatori Jeep Kitchen Special Food spread"
          fill
          priority
          sizes="50vw"
          className="object-cover transform scale-105 hover:scale-100 transition-transform duration-[15000ms] ease-out"
        />
        {/* Deep, rich gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-black/80 to-black/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Top logo */}
      <div className="flex items-center gap-3 relative z-10 animate-fade-in-up">
        <div className="p-3 bg-primary/20 backdrop-blur-xl border border-primary/40 rounded-2xl text-primary shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]">
          <Image
            src={IMAGES.logo}
            alt="logo"
            width={28}
            height={28}
            className="rounded-full w-7 h-7 object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-black tracking-tight text-white leading-none">
            Chatori Jeep
          </span>
          <span className="text-primary font-sans font-medium text-sm tracking-widest uppercase mt-1">
            Kitchen Panel
          </span>
        </div>
      </div>

      {/* Middle Copy */}
      <div className="space-y-6 relative z-10 max-w-[480px] mb-12 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <h2 className="font-heading text-5xl lg:text-[4rem] font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
          Control the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-orange-500">chaos.</span>
        </h2>
        <div className="w-12 h-1 bg-primary rounded-full"></div>
        <p className="text-zinc-300 text-lg leading-relaxed font-medium drop-shadow-md">
          Sign in to manage live preparation statuses, adjust menu items, and track your outlet&apos;s sales performance in real time.
        </p>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 flex items-center gap-3 text-sm text-zinc-500 font-medium animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <span>&copy; 2026 Chatori Jeep</span>
        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
        <span>Secure Access Only</span>
      </div>
    </div>
  );
}
