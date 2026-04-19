import { cn } from "@/lib/utils";
import type { OrderTimelineStep } from "@/types/dashboard";

export function StatusTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mt-0.5 size-3 rounded-full border",
                step.done ? "border-primary bg-primary" : "border-border bg-background"
              )}
            />
            {index < steps.length - 1 ? <div className="mt-1 h-10 w-px bg-border" /> : null}
          </div>
          <div className="pb-2">
            <p className={cn("font-medium", !step.done && "text-muted-foreground")}>{step.label}</p>
            <p className="text-sm text-muted-foreground">{step.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
