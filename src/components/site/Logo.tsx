import logoAsset from "@/assets/south-delhi-logo.asset.json";

export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="South Delhi Farms & Floors"
      className={`${className} object-contain`}
      loading="eager"
      decoding="async"
    />
  );
}
