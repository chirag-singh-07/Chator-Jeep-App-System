import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4 shadow-sm", className)}>{children}</div>;
}
