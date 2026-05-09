import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "mint" | "coral" | "gold";
};

const toneClasses = {
  mint: "bg-teal-50 text-mint",
  coral: "bg-orange-50 text-coral",
  gold: "bg-amber-50 text-gold"
};

export function StatCard({ label, value, icon: Icon, tone = "mint" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
