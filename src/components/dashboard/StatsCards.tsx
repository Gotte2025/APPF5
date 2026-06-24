import { Card } from "@/components/ui/Card";

interface Stat {
  label: string;
  value: string | number;
}

interface StatsCardsProps {
  stats: Stat[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="text-center">
          <p className="font-display text-2xl text-linea">{stat.value}</p>
          <p className="mt-1 text-xs text-linea-dim">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
