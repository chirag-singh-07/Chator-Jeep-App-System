import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCard } from "@/types/dashboard";

export function StatsGrid({ data }: { data: StatsCard[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((card) => (
        <Card key={card.title} className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {card.trendUp ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />}
              {card.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
