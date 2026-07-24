import { useState } from "react";
import logoUrl from "@/assets/south-delhi-logo.png";

export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src={logoUrl}
        alt="South Delhi Farms & Floors"
        className={className}
        onError={() => setFailed(true)}
        draggable={false}
      />
    );
  }

  return (
    <span
      className={`${className} inline-flex flex-col items-start justify-center leading-none select-none`}
      aria-label="South Delhi Farms & Floors"
    >
      <span
        className="italic-serif text-foreground tracking-[0.02em] text-[15px] md:text-[17px] leading-[1]"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}
      >
        South Delhi
      </span>
      <span
        className="text-foreground/85 tracking-[0.28em] uppercase text-[8px] md:text-[9px] mt-1"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}
      >
        Farms &amp; Floors
      </span>
    </span>
  );
}
