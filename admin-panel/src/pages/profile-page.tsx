import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { currentAdminProfile, statsCards } from "@/data/dashboard-data";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Camera,
  Key,
  Globe,
  Layout,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfilePage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-primary/30 via-primary/10 to-transparent overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000')] bg-cover opacity-20 mix-blend-overlay" />
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-2xl">
                <div className="h-full w-full rounded-2xl bg-muted overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAdminProfile.name}`}
                    alt={currentAdminProfile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {currentAdminProfile.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge value={currentAdminProfile.role} />
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {currentAdminProfile.title}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-8 flex gap-2">
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold">
                    {currentAdminProfile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold">
                    {currentAdminProfile.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Joined Platform
                  </p>
                  <p className="text-sm font-semibold">
                    {currentAdminProfile.joinedDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {statsCards.slice(0, 4).map((stat) => (
                <div key={stat.title} className="p-3 rounded-2xl bg-muted/30">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6">
              <TabsTrigger value="overview" className="rounded-xl px-6">
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl px-6">
                Activity
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-6">
                Security
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-6">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="rounded-3xl border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">About Me</CardTitle>
                      <CardDescription>
                        A brief professional bio
                      </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Layout className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                    "{currentAdminProfile.bio}"
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Role & Permissions
                      </CardTitle>
                      <CardDescription>
                        Access levels granted to your account
                      </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentAdminProfile.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/50"
                      >
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium text-purple-900">
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="rounded-3xl border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {[
                      {
                        action: "Updated Food Item Status",
                        item: "Paneer Tikka Wrap",
                        time: "2 hours ago",
                      },
                      {
                        action: "Verified Restaurant Vendor",
                        item: "Central Cloud Kitchen",
                        time: "5 hours ago",
                      },
                      {
                        action: "Created New Category",
                        item: "Combos",
                        time: "Yesterday",
                      },
                      {
                        action: "Modified Delivery Zone",
                        item: "Noida Sector 18",
                        time: "2 days ago",
                      },
                    ].map((act, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="text-sm font-semibold">{act.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.item} • {act.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-3xl border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Key className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold">Change Password</p>
                      <p className="text-xs text-muted-foreground">
                        Keep your account secure
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold">Two-Factor Auth</p>
                      <p className="text-xs text-muted-foreground">
                        Add extra layer of protection
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
