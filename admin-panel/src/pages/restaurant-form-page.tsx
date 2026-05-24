"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/services/admin.service";

const indianPhoneRegex = /^[6-9]\d{9}$/;

export function RestaurantFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [type, setType] = useState("active");
  const [heroImage, setHeroImage] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errors = {
    name: submitted && !name.trim() ? "Restaurant name is required." : "",
    owner: submitted && !owner.trim() ? "Owner name is required." : "",
    email: submitted && !email.trim() ? "Contact email is required." : "",
    phone: submitted && phone && !indianPhoneRegex.test(phone) ? "Enter a valid Indian 10-digit mobile number." : "",
    password: submitted && password.length < 6 ? "Password must be at least 6 characters." : "",
    location: submitted && !location.trim() ? "Location is required." : ""
  };

  const onSave = async () => {
    setSubmitted(true);
    if (errors.name || errors.owner || errors.email || errors.phone || errors.password || errors.location || !name || !owner || !email || !location || !password) {
      return;
    }
    
    setIsLoading(true);
    try {
      await adminService.createRestaurant({
        ownerName: owner,
        email,
        password,
        phone,
        restaurantName: name,
        type,
        location,
        cuisine,
        heroImage,
        logoImage,
        notes
      });
      toast.success("Restaurant created successfully.");
      navigate("/restaurants?type=" + type);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Add New Restaurant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Restaurant Name" error={errors.name}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} disabled={isLoading} />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Owner Name" error={errors.owner}>
              <Input value={owner} onChange={(event) => setOwner(event.target.value)} aria-invalid={Boolean(errors.owner)} disabled={isLoading} />
            </FormField>
            <FormField label="Restaurant Status">
              <Select value={type} onValueChange={setType}>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Contact Email" error={errors.email}>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} disabled={isLoading} />
            </FormField>
            <FormField label="Contact Phone" error={errors.phone}>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 digit mobile number"
                aria-invalid={Boolean(errors.phone)}
                disabled={isLoading}
              />
            </FormField>
          </div>

          <FormField label="Owner Login Password" error={errors.password}>
             <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} placeholder="Assign a default password" disabled={isLoading} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
             </div>
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Location" error={errors.location}>
              <Input value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={Boolean(errors.location)} disabled={isLoading} />
            </FormField>
            <FormField label="Cuisine">
              <Input value={cuisine} onChange={(event) => setCuisine(event.target.value)} placeholder="e.g. Burgers, Bowls" disabled={isLoading} />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Banner Image" description="Wide header image for the restaurant.">
              <div className="flex flex-col gap-3">
                <UploadDropzone preview={heroImage} onChange={setHeroImage} folder="restaurants/banners" />
                <Input value={heroImage} onChange={(event) => setHeroImage(event.target.value)} placeholder="Paste banner image URL" disabled={isLoading} />
              </div>
            </FormField>

            <FormField label="Logo Image" description="Square profile image for the restaurant.">
              <div className="flex flex-col gap-3">
                <UploadDropzone preview={logoImage} onChange={setLogoImage} folder="restaurants/logos" />
                <Input value={logoImage} onChange={(event) => setLogoImage(event.target.value)} placeholder="Paste logo image URL" disabled={isLoading} />
              </div>
            </FormField>
          </div>

          <FormField label="Internal Notes">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ops or approval notes..." disabled={isLoading} />
          </FormField>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Restaurant
            </Button>
            <Button variant="outline" asChild disabled={isLoading}>
              <Link to="/restaurants">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm h-fit">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative">
            {heroImage ? (
              <img src={heroImage} alt={name || "Banner preview"} className="h-40 w-full rounded-t-2xl object-cover bg-muted" />
            ) : (
              <div className="h-40 w-full rounded-t-2xl bg-muted border border-dashed flex items-center justify-center text-sm text-muted-foreground">Banner Preview</div>
            )}
            
            <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-background bg-background shadow-sm overflow-hidden">
              {logoImage ? (
                <img src={logoImage} alt={name || "Logo preview"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">Logo</div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <p className="text-xl font-semibold">{name || "Restaurant Name"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{location || "Location preview"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{cuisine || "Cuisine preview"}</p>
            <p className="mt-3 text-sm text-muted-foreground">{notes || "Internal notes preview"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
