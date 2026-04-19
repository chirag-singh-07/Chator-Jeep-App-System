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
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({
  asChild,
  children
}: {
  asChild?: boolean;
  children: React.ReactElement<{ onClick?: () => void }>;
}) {
  const { setOpen } = useDropdownContext();

  if (!asChild) {
    return (
      <button 
        type="button" 
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
    );
  }

  return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(true);
    }
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
      <div 
        className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[1px]" 
        onClick={() => setOpen(false)} 
      />
      <div
        className={cn(
          "absolute top-full z-[70] mt-3 min-w-[220px] overflow-hidden rounded-2xl border bg-background/98 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out",
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
  return <div className={cn("px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("-mx-1.5 my-1.5 h-px bg-border/50", className)} {...props} />;
}

interface DropdownMenuItemProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function DropdownMenuItem({ className, asChild, children, ...props }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownContext();
  
  const content = (
    <div className="flex w-full items-center gap-2">
      {children}
    </div>
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary outline-none cursor-pointer",
        className,
        (children.props as any).className
      ),
      onClick: (e: React.MouseEvent) => {
        (children.props as any).onClick?.(e);
        setOpen(false);
      }
    });
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary outline-none cursor-pointer",
        className
      )}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {content}
    </button>
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
      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5"
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
