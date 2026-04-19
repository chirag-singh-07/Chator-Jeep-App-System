import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StatsCard } from "@/types/dashboard";

export function StatsGrid({ data }: { data: StatsCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((card) => (
        <Card key={card.title} className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              {card.trendUp ? <ArrowUpRight className="text-primary" /> : <ArrowDownRight className="text-destructive" />}
            </div>
            <div>
              <p className="text-3xl font-semibold">{card.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
