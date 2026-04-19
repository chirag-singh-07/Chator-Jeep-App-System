import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Edit2, Trash2, Tag } from "lucide-react";
import { addonsSeed } from "@/data/dashboard-data";
import { StatusBadge } from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AddonsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAddons = addonsSeed.filter(
    (addon) =>
      addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addon.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Add-ons</h1>
          <p className="text-muted-foreground">
            Manage extra toppings, sides, and beverages for your food items.
          </p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add New Add-on
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search add-ons..."
                className="pl-10 rounded-xl border-none bg-muted/50 focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl">
                Filter
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-muted/50">
                  <th className="pb-4 pt-0 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="pb-4 pt-0 font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="pb-4 pt-0 font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="pb-4 pt-0 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-4 pt-0 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/30">
                {filteredAddons.map((addon) => (
                  <tr
                    key={addon.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {addon.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 py-2 px-3 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-lg text-xs font-medium">
                        {addon.type}
                      </span>
                    </td>
                    <td className="py-4 font-medium">₹{addon.price}</td>
                    <td className="py-4">
                      <StatusBadge value={addon.status as string} />
                    </td>
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="rounded-lg">
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addonsSeed.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-emerald-50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Extra Cheese</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg bg-gradient-to-br from-blue-50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹75.00</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
