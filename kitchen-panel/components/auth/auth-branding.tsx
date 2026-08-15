import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon } from "@hugeicons/core-free-icons";

export function AuthBranding() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 text-white h-full overflow-hidden select-none">
      {/* Background Image overlay */}
      <div className="absolute inset-0 -z-10 bg-zinc-950">
        <Image
          src={IMAGES.hero.main}
          alt="Chatori Jeep Kitchen Special Food spread"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-45 transform scale-102 hover:scale-100 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-radial-to-br from-primary/10 via-zinc-950/60 to-zinc-950/90" />
      </div>

      {/* Top logo */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
          <HugeiconsIcon icon={FireIcon} size={20} strokeWidth={2.5} className="animate-pulse" />
        </div>
        <span className="font-heading text-xl font-black tracking-tight text-white">
          Chatori Jeep<span className="text-primary font-sans font-light"> Kitchen</span>
        </span>
      </div>

      {/* Middle Copy */}
      <div className="space-y-4 relative z-10 max-w-[440px] mb-8">
        <h2 className="font-heading text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
          Your kitchen operations, <br />
          <span className="text-primary">unified.</span>
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
          Sign in to manage live preparation statuses, adjust menu items, and track your outlet's sales performance in real time.
        </p>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 flex items-center gap-2 text-xs text-zinc-400">
        <span>&copy; 2026 Chatori Jeep Kitchen.</span>
        <span>&middot;</span>
        <span>Restaurant Control Center.</span>
      </div>
    </div>
  );
}
