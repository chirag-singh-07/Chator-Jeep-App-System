import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) {
    throw new Error("Dropdown components must be used inside DropdownMenu");
  }
  return ctx;
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}

function DropdownMenuTrigger({
  asChild,
  children
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const { setOpen } = useDropdownContext();

  if (!asChild) {
    return (
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
    );
  }

  return React.cloneElement(children, {
    onClick: () => setOpen(true)
  });
}

function DropdownMenuContent({
  className,
  children,
  align = "start"
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const { open, setOpen } = useDropdownContext();

  if (!open) {
    return null;
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="close" />
      <div
        className={cn(
          "absolute z-50 mt-2 min-w-48 rounded-xl border bg-card p-1 shadow-xl",
          align === "end" ? "right-0" : "left-0",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props} />;
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<"button">) {
  const { setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      className={cn("flex w-full items-center rounded-lg px-2 py-1.5 text-sm hover:bg-muted", className)}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
    >
      <span>{children}</span>
      {checked ? <Check className="h-4 w-4 text-primary" /> : null}
    </button>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem
};
