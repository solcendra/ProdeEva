import type { ReactNode } from "react";

export function EvaBadge({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#00A94F]/30 bg-[#00A94F]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#007A38]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00A94F]" aria-hidden />
      {children ?? "Predicción de Eva"}
    </span>
  );
}
