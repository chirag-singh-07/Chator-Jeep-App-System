import { useEffect, useState } from "react";
import {
  Bell,
  ChevronsLeftRight,
  Menu,
  Search,
  Plus,
  MessageSquare,
  UtensilsCrossed,
  Layers,
  Store,
  Tags,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TopbarProps = {
  title: string;
  subtitle: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onToggleCollapse: () => void;
};

export function Topbar({
  title,
  subtitle,
  collapsed,
  onToggleSidebar,
  onToggleCollapse,
}: TopbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/food-items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(currentTime);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/60 px-4 py-2.5 backdrop-blur-2xl md:px-6 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Branding & Navigation Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden rounded-xl h-9 w-9 border-muted/50"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:inline-flex rounded-xl h-9 w-9 border-muted/50 hover:bg-muted/50"
              onClick={onToggleCollapse}
            >
              <ChevronsLeftRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          <div className="h-6 w-[1px] bg-muted/40 hidden sm:block" />

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight md:text-lg text-foreground/90 whitespace-nowrap">
                {title}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hidden lg:inline">
                  Live
                </span>
              </div>
            </div>
            {subtitle && (
              <p className="hidden md:block truncate text-[11px] text-muted-foreground font-medium opacity-80">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center Section: Search Bar (Premium Floating Style) */}
        <div className="relative hidden w-full max-w-md xl:block mx-4 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search dishes or orders (Press Enter to search)..."
            className="pl-10 h-10 rounded-xl bg-muted/30 border-muted/20 focus-visible:ring-primary/20 hover:bg-muted/50 transition-all placeholder:text-muted-foreground/40 w-full text-sm shadow-sm"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium flex">
              <span className="text-xs">↵</span>
            </kbd>
          </div>
        </div>

        {/* Right Section: Tooling & User */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Quick Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="hidden sm:flex rounded-xl shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all gap-1.5 h-9 px-4 border-none"
              >
                <Plus className="h-4 w-4 text-white" />
                <span className="font-bold text-xs text-white">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/food-items/new" className="flex items-center gap-2">
                  <UtensilsCrossed className="size-4 text-primary" />
                  <span>Add Food Item</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/food-items/bulk-upload" className="flex items-center gap-2">
                  <Layers className="size-4 text-emerald-600" />
                  <span>Bulk Menu Upload</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/restaurants/new" className="flex items-center gap-2">
                  <Store className="size-4 text-amber-600" />
                  <span>Onboard Kitchen</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/categories/new" className="flex items-center gap-2">
                  <Tags className="size-4 text-sky-600" />
                  <span>New Category</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/users/new/delivery" className="flex items-center gap-2">
                  <Truck className="size-4 text-purple-600" />
                  <span>Add Delivery Agent</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-[1px] bg-muted/40 hidden md:block" />

          {/* Time & Notifications */}
          <div className="flex items-center gap-1">
            <div className="hidden lg:flex flex-col items-end px-2 mr-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                {formattedDate}
              </span>
              <span className="text-[10px] font-semibold text-primary/70">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center bg-muted/20 rounded-xl p-0.5 border border-muted/30">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/80 relative"
                asChild
                title="Support Tickets"
              >
                <Link to="/support/tickets">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/80 relative"
                asChild
                title="Notifications"
              >
                <Link to="/system/notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>

              <ThemeToggle />
            </div>
          </div>

          <div className="h-8 w-[1px] bg-muted/40 mx-0.5" />

          <UserNav />
        </div>
      </div>
    </header>
  );
}
