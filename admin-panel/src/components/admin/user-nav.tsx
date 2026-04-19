import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { currentAdminProfile } from "@/data/dashboard-data";
import { LogOut, Settings, User, CreditCard, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function UserNav() {
  const { user } = useAuthStore();
  const name = user?.name || "Admin";
  const email = user?.email || "admin@example.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-xl p-0 shadow-sm border border-muted/50 overflow-hidden hover:scale-105 transition-transform"
        >
          <img
            src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${name}&backgroundColor=f1f5f9`}
            alt={name}
            className="h-full w-full object-cover"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">
              {name}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1 text-primary/70">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />

        <div className="flex flex-col gap-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/profile" className="flex w-full items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/payments" className="flex w-full items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/settings" className="flex w-full items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl cursor-pointer">
            <div className="flex w-full items-center">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem className="rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer">
          <div className="flex w-full items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
