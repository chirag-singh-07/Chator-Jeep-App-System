import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  BellDot,
  ChartColumnIncreasing,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

type LoginErrorResponse = {
  message?: string;
};

type AdminPage = "overview" | "orders" | "menu" | "customers" | "delivery" | "analytics" | "settings";

const APP_NAME = "Chatori Jeep";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const navItems: Array<{ key: AdminPage; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "menu", label: "Menu", icon: ChefHat },
  { key: "customers", label: "Customers", icon: UserRound },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "analytics", label: "Analytics", icon: ChartColumnIncreasing },
  { key: "settings", label: "Settings", icon: Settings }
];

const overviewStats = [
  { title: "Total Orders", value: "182", change: "+12.5%", icon: ShoppingBag },
  { title: "Revenue", value: "Rs 72,460", change: "+9.2%", icon: CircleDollarSign },
  { title: "Pending Dispatch", value: "24", change: "-6.8%", icon: Truck },
  { title: "Avg Prep Time", value: "18 min", change: "-2.1%", icon: Clock3 }
];

const orders = [
  { id: "CJ-9088", customer: "Ananya Sharma", amount: "Rs 980", items: 4, status: "Preparing" },
  { id: "CJ-9087", customer: "Rahul Verma", amount: "Rs 340", items: 2, status: "Out for Delivery" },
  { id: "CJ-9086", customer: "Ira Kapoor", amount: "Rs 1,260", items: 5, status: "Delivered" },
  { id: "CJ-9085", customer: "Samar Jain", amount: "Rs 620", items: 3, status: "Pending Payment" }
];

const menuItems = [
  { name: "Paneer Tikka Wrap", category: "Wraps", price: "Rs 249", stock: "In stock" },
  { name: "Smoky Tandoori Momos", category: "Snacks", price: "Rs 189", stock: "In stock" },
  { name: "Masala Kulcha Combo", category: "Combos", price: "Rs 299", stock: "Low stock" },
  { name: "Loaded Chatori Fries", category: "Sides", price: "Rs 159", stock: "Out of stock" }
];

const customers = [
  { name: "Ananya Sharma", orders: 14, spent: "Rs 7,420", segment: "Loyal" },
  { name: "Kunal Mehta", orders: 9, spent: "Rs 4,880", segment: "Regular" },
  { name: "Ritika Ghosh", orders: 5, spent: "Rs 2,360", segment: "Growing" },
  { name: "Arjun Patel", orders: 2, spent: "Rs 940", segment: "New" }
];

const deliveryFleet = [
  { rider: "Vikas", zone: "North", active: 4, status: "On Route" },
  { rider: "Imran", zone: "Central", active: 2, status: "Available" },
  { rider: "Deepak", zone: "West", active: 5, status: "On Route" },
  { rider: "Aman", zone: "South", active: 0, status: "Offline" }
];

const statusVariant = (status: string): "secondary" | "outline" | "default" => {
  if (status === "Delivered" || status === "In stock" || status === "Loyal" || status === "Available") {
    return "secondary";
  }
  if (status === "Pending Payment" || status === "Low stock" || status === "Offline") {
    return "outline";
  }
  return "default";
};

const readRoleFromToken = (accessToken: string): string | null => {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) {
      return null;
    }
    const decoded = JSON.parse(atob(payload)) as { role?: string };
    return decoded.role ?? null;
  } catch {
    return null;
  }
};

const SectionShell = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <Card className="border-border/60 bg-card shadow-sm">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string>(() => localStorage.getItem("adminAccessToken") ?? "");
  const [page, setPage] = useState<AdminPage>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full"
      }).format(new Date()),
    []
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as LoginErrorResponse | null;
        throw new Error(errorData?.message ?? "Unable to login with these credentials.");
      }

      const data = (await response.json()) as LoginResponse | { data?: LoginResponse };
      const accessToken = "accessToken" in data ? data.accessToken : data.data?.accessToken;
      if (!accessToken) {
        throw new Error("Access token was not returned by server.");
      }

      const role = readRoleFromToken(accessToken);
      if (role !== "ADMIN") {
        throw new Error("Access denied. This panel is only for admins.");
      }

      localStorage.setItem("adminAccessToken", accessToken);
      setToken(accessToken);
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAccessToken");
    setToken("");
    setPassword("");
    setPage("overview");
  };

  const renderPage = () => {
    if (page === "overview") {
      return (
        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((item) => (
              <Card key={item.title} className="border-border/60 bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.change} this week</p>
                </CardContent>
              </Card>
            ))}
          </section>
          <SectionShell title="Live Order Pipeline" description="Realtime status snapshot across all outlets.">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { stage: "New Orders", count: 26, color: "bg-amber-500/15 text-amber-800" },
                { stage: "Preparing", count: 18, color: "bg-orange-500/15 text-orange-800" },
                { stage: "Out for Delivery", count: 13, color: "bg-blue-500/15 text-blue-800" },
                { stage: "Delivered", count: 125, color: "bg-emerald-500/15 text-emerald-800" }
              ].map((item) => (
                <div key={item.stage} className={cn("rounded-xl border p-4", item.color)}>
                  <p className="text-sm font-medium">{item.stage}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.count}</p>
                </div>
              ))}
            </div>
          </SectionShell>
        </div>
      );
    }

    if (page === "orders") {
      return (
        <SectionShell title="Order Management" description="Track and update every order from one place.">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-2 py-1 font-medium">Order ID</th>
                  <th className="px-2 py-1 font-medium">Customer</th>
                  <th className="px-2 py-1 font-medium">Items</th>
                  <th className="px-2 py-1 font-medium">Amount</th>
                  <th className="px-2 py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="rounded-lg bg-muted/35">
                    <td className="px-2 py-2 font-medium">{order.id}</td>
                    <td className="px-2 py-2">{order.customer}</td>
                    <td className="px-2 py-2">{order.items}</td>
                    <td className="px-2 py-2">{order.amount}</td>
                    <td className="px-2 py-2">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionShell>
      );
    }

    if (page === "menu") {
      return (
        <SectionShell title="Menu Catalog" description="Control dishes, pricing, and stock visibility.">
          <div className="grid gap-4 md:grid-cols-2">
            {menuItems.map((item) => (
              <Card key={item.name} className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="font-semibold">{item.price}</span>
                  <Badge variant={statusVariant(item.stock)}>{item.stock}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionShell>
      );
    }

    if (page === "customers") {
      return (
        <SectionShell title="Customer Insights" description="See your top users and engagement health.">
          <div className="grid gap-4 md:grid-cols-2">
            {customers.map((item) => (
              <Card key={item.name} className="border-border/60">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} orders placed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.spent}</p>
                    <Badge variant={statusVariant(item.segment)}>{item.segment}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionShell>
      );
    }

    if (page === "delivery") {
      return (
        <SectionShell title="Delivery Control" description="Monitor rider activity and service zones.">
          <div className="grid gap-4 md:grid-cols-2">
            {deliveryFleet.map((item) => (
              <Card key={item.rider} className="border-border/60">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium">{item.rider}</p>
                    <p className="text-sm text-muted-foreground">{item.zone} zone</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{item.active} active deliveries</p>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionShell>
      );
    }

    if (page === "analytics") {
      return (
        <SectionShell title="Business Analytics" description="Performance trends for decisions and planning.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Weekly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-44 items-end gap-2">
                  {[52, 64, 58, 76, 71, 84, 90].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-md bg-primary/80" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Channel Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "App Orders", value: "56%" },
                  { label: "Website Orders", value: "28%" },
                  { label: "Call Orders", value: "16%" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </SectionShell>
      );
    }

    return (
      <SectionShell title="Admin Settings" description="Manage panel and business configuration.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Outlet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="outletName">Outlet Name</Label>
                <Input id="outletName" defaultValue="Chatori Jeep - Main Kitchen" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact">Support Number</Label>
                <Input id="contact" defaultValue="+91 98989 98989" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Operational Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Auto-assign riders</span>
                <Badge>Enabled</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Night order mode</span>
                <Badge variant="outline">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>WhatsApp updates</span>
                <Badge>Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>
    );
  };

  if (!token) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(244,143,56,0.25),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(255,204,150,0.25),transparent_40%)]" />
        <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center p-6 md:p-10">
          <Card className="grid w-full overflow-hidden border-border/60 bg-card/90 shadow-2xl backdrop-blur md:grid-cols-2">
            <CardContent className="flex flex-col justify-between bg-[linear-gradient(160deg,rgba(105,59,22,0.92),rgba(43,24,9,0.96))] p-8 text-white md:p-10">
              <div>
                <Badge className="mb-5 rounded-full bg-white/10 text-white hover:bg-white/20">Admin Command Center</Badge>
                <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{APP_NAME}</h1>
                <p className="mt-4 max-w-sm text-sm text-white/85 md:text-base">
                  Orders, kitchen, delivery, and growth metrics in one intelligent control panel.
                </p>
              </div>
              <div className="space-y-3 text-sm text-white/85">
                <p className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Multi-page admin workspace
                </p>
                <p className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Live order operations
                </p>
                <p className="flex items-center gap-2">
                  <ChartColumnIncreasing className="h-4 w-4" /> Performance analytics snapshots
                </p>
              </div>
            </CardContent>
            <CardContent className="p-8 md:p-10">
              <CardHeader className="px-0 pb-6">
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Sign in to access the {APP_NAME} dashboard.</CardDescription>
              </CardHeader>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@chatorijeep.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="h-10 w-full text-sm" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in to Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(255,248,240,0.55),transparent)] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-72 border-r bg-card px-4 py-5 transition-transform duration-300 md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-semibold">{APP_NAME}</h1>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setPage(item.key);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  page === item.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
            <p className="font-medium">Today Target</p>
            <p className="mt-1 text-muted-foreground">Rs 80,000 sales with 150+ delivered orders.</p>
          </div>
        </aside>

        <div
          className={cn(
            "fixed inset-0 z-20 bg-black/40 transition-opacity md:hidden",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen((v) => !v)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div className="relative hidden w-full max-w-md md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search orders, customers, items..." />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {today}
                </Badge>
                <Button variant="outline" size="icon">
                  <BellDot className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <UserRound className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <section className="space-y-5 p-4 md:p-6">{renderPage()}</section>
        </div>
      </div>
    </main>
  );
}

export default App;
