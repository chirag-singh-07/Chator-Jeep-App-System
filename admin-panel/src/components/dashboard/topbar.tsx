import { Bell, ChevronsLeftRightEllipsis, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
};

export function Topbar({ title, subtitle, onToggleSidebar, onToggleCollapse, collapsed }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold md:text-xl">{title}</h2>
          <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>
        </div>

        <div className="relative ml-auto hidden w-full max-w-sm lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders, users, categories..." className="pl-9" />
        </div>

        <Button variant="outline" size="icon" className="hidden md:inline-flex" onClick={onToggleCollapse}>
          <ChevronsLeftRightEllipsis className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
