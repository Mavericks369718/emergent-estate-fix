import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import legacy from "@/assets/legacy-courtyard.jpg";

const PARAGRAPHS = [
  "We create spaces where architecture meets privacy, where elegance meets permanence, and where every address becomes a statement of identity.",
  "From ultra-luxury farmhouses to investment-grade builder floors, every property is selected for timeless design, prestige and long-term value.",
];

const HIGHLIGHTS = new Set(["architecture", "privacy", "elegance"]);

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const cleaned = word.replace(/[.,]/g, "").toLowerCase();
  const isHighlight = HIGHLIGHTS.has(cleaned);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {isHighlight ? <span className="italic-serif">{word}</span> : word}
      <span>&nbsp;</span>
    </motion.span>
  );
}

export function LegacySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const allWords = PARAGRAPHS.flatMap((p, pi) =>
    p.split(" ").map((w, wi) => ({ w, key: `${pi}-${wi}`, p: pi }))
  );

  return (
    <section ref={ref} className="relative pb-32 md:pb-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl">
          <img
            src={legacy}
            alt="Indian luxury mansion courtyard at twilight"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60" />
          <div className="grain" />
        </div>

        <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
          <p className="text-2xl md:text-4xl lg:text-5xl leading-[1.25] tracking-[-0.02em] font-light text-foreground">
            {allWords.map((item, idx) => {
              const start = idx / allWords.length;
              const end = Math.min(1, (idx + 6) / allWords.length);
              return (
                <Word
                  key={item.key}
                  word={item.w}
                  range={[start, end]}
                  progress={scrollYProgress}
                />
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
