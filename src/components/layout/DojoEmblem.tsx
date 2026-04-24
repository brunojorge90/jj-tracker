import Image from "next/image";
import tocaLogo from "@/image/Toca_logo.png";

export function DojoEmblem() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden"
    >
      <div
        className="relative w-[92vw] h-[92vw] max-w-[820px] max-h-[820px] opacity-[0.07]"
        style={{
          maskImage: "radial-gradient(circle, black 40%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 78%)",
          filter: "drop-shadow(0 0 80px rgba(245, 158, 11, 0.25))",
        }}
      >
        <Image
          src={tocaLogo}
          alt=""
          fill
          sizes="(max-width: 768px) 92vw, 820px"
          className="object-contain select-none"
          priority={false}
        />
      </div>
    </div>
  );
}

export function DojoHeroLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-full bg-[color:var(--dojo-amber)] blur-2xl opacity-50 scale-125"
        aria-hidden="true"
      />
      <div
        className="relative rounded-full overflow-hidden ring-2 ring-[color:var(--dojo-amber)]/40 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.8),inset_0_0_0_1px_rgba(245,158,11,0.2)]"
        style={{ background: "radial-gradient(circle, #1a1410 0%, #0a0807 100%)" }}
      >
        <Image
          src={tocaLogo}
          alt="Equipe Gorila Jiu-Jitsu — Prof. Éder Silva"
          width={192}
          height={192}
          priority
          className="w-full h-full object-cover scale-[1.02]"
        />
      </div>
    </div>
  );
}
