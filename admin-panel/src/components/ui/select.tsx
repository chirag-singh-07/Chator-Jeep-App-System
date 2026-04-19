import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({
  value,
  onValueChange,
  children
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactElement<{ value: string; children: React.ReactNode }>[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm shadow-sm outline-none transition",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        )}
      >
        {children.map((child) => (
          <option key={child.props.value} value={child.props.value}>
            {child.props.children}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

export { Select, SelectItem };
