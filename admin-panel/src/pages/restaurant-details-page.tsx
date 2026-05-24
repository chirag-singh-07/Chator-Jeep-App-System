import { useEffect, useState } from "react";
import { ArrowLeft, PencilLine, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function RestaurantDetailsPage() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    
    setLoading(true);
    adminService.getRestaurantById(restaurantId)
      .then((res) => {
        setRestaurant(res.data);
      })
      .catch((err) => {
        console.error("Failed to load restaurant details:", err);
        setError("Failed to load restaurant details. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="grid gap-4 xl:grid-cols-3">
           <Skeleton className="h-[400px] rounded-2xl" />
           <Skeleton className="h-[400px] rounded-2xl xl:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <Card className="rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <p className="text-lg font-semibold text-destructive">{error || "Restaurant not found."}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/restaurants">Back to Restaurants</Link>
        </Button>
      </Card>
    );
  }

  const logoUrl = restaurant.logoUrls?.full || restaurant.logoUrls?.medium || restaurant.logoUrls?.default;
  const bannerUrl = restaurant.bannerUrls?.full || restaurant.bannerUrls?.medium || restaurant.bannerUrls?.default;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
            <Button variant="outline" className="w-fit" asChild>
            <Link to="/restaurants">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
        </div>
        <Button variant="outline" className="w-fit" asChild>
          <Link to="/restaurants/new">
            <PencilLine className="mr-2 h-4 w-4" />
            Edit Restaurant
          </Link>
        </Button>
      </div>

      {bannerUrl && (
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden mb-2 shadow-sm border">
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            {logoUrl && (
                <div className="absolute bottom-4 left-6 h-24 w-24 md:h-32 md:w-32 rounded-xl border-4 border-background overflow-hidden bg-background shadow-lg">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <StatusBadge value={restaurant.status} />
              {restaurant.isOpen && <Badge variant="default" className="bg-green-500 hover:bg-green-600">Currently Open</Badge>}
              {!restaurant.isOpen && <Badge variant="secondary">Currently Closed</Badge>}
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium">{restaurant.ownerName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{restaurant.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{restaurant.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Cuisines</span>
                    <span className="font-medium text-right">{restaurant.cuisines?.join(", ") || "N/A"}</span>
                </div>
                <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Total Earnings</span>
                    <span className="font-semibold text-primary">{formatCurrency(restaurant.totalEarnings || 0)}</span>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Location & Address</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="rounded-xl bg-muted/40 p-4 border">
                 <p className="font-medium text-base mb-1">{restaurant.address?.line1 || "No address provided"}</p>
                 <p className="text-sm text-muted-foreground">
                    {restaurant.address?.city && `${restaurant.address.city}, `}
                    {restaurant.address?.state && `${restaurant.address.state} `}
                    {restaurant.address?.pinCode}
                 </p>
                 {restaurant.location?.coordinates && (
                     <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                         <span className="font-medium text-foreground">Coordinates:</span>
                         {restaurant.location.coordinates[1].toFixed(4)}, {restaurant.location.coordinates[0].toFixed(4)}
                     </div>
                 )}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>Account information for payouts.</CardDescription>
            </CardHeader>
            <CardContent>
            {restaurant.bankDetails?.accountNumber ? (
                <div className="grid gap-3 text-sm rounded-xl border p-4 bg-muted/20">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Holder</span>
                        <span className="font-medium">{restaurant.bankDetails.accountHolderName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank Name</span>
                        <span className="font-medium">{restaurant.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="font-medium">{restaurant.bankDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IFSC Code</span>
                        <span className="font-medium uppercase">{restaurant.bankDetails.ifscCode}</span>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No bank details have been added yet.
                </div>
            )}
            </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Verification and legal documents.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-3">
                   {restaurant.fssaiLicense && (
                        <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">FSSAI License</p>
                                    <p className="text-xs text-muted-foreground">{restaurant.fssaiLicense}</p>
                                </div>
                            </div>
                        </div>
                   )}
                   {restaurant.documents && restaurant.documents.length > 0 ? (
                       restaurant.documents.map((doc: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        {doc.url.match(/\.(jpeg|jpg|gif|png)$/i) ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{doc.label}</p>
                                        {doc.verifiedAt && <p className="text-xs text-green-600">Verified</p>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={doc.url} target="_blank" rel="noreferrer">
                                        View <ExternalLink className="ml-2 w-3 h-3" />
                                    </a>
                                </Button>
                           </div>
                       ))
                   ) : !restaurant.fssaiLicense ? (
                       <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                         No documents uploaded.
                       </div>
                   ) : null}
               </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
