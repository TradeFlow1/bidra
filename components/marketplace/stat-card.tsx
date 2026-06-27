import { cn } from "@/components/ui";

export function StatCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-[22px] border border-[var(--bd-border)] bg-white p-5 shadow-[0_14px_40px_rgba(18,7,36,0.06)]", className)}>
      <p className="text-3xl font-black tracking-[-0.055em] text-[var(--bd-ink)]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[var(--bd-muted)]">{label}</p>
    </div>
  );
}
