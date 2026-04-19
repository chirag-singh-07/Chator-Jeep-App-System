"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function RestaurantFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [type, setType] = useState("requested");
  const [heroImage, setHeroImage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: submitted && !name.trim() ? "Restaurant name is required." : "",
    owner: submitted && !owner.trim() ? "Owner name is required." : "",
    email: submitted && !email.trim() ? "Contact email is required." : "",
    location: submitted && !location.trim() ? "Location is required." : ""
  };

  const onSave = () => {
    setSubmitted(true);
    if (errors.name || errors.owner || errors.email || errors.location || !name || !owner || !email || !location) {
      return;
    }
    toast.success("Restaurant request created.");
    navigate("/restaurants?type=requested");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Add New Restaurant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Restaurant Name" error={errors.name}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Owner Name" error={errors.owner}>
              <Input value={owner} onChange={(event) => setOwner(event.target.value)} aria-invalid={Boolean(errors.owner)} />
            </FormField>
            <FormField label="Restaurant Type">
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
              <Input value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} />
            </FormField>
            <FormField label="Contact Phone">
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Location" error={errors.location}>
              <Input value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={Boolean(errors.location)} />
            </FormField>
            <FormField label="Cuisine">
              <Input value={cuisine} onChange={(event) => setCuisine(event.target.value)} placeholder="e.g. Burgers & Bowls" />
            </FormField>
          </div>

          <FormField label="Hero Image" description="Optional preview image for the restaurant listing and detail page.">
            <div className="flex flex-col gap-3">
              <UploadDropzone preview={heroImage} onChange={setHeroImage} />
              <Input value={heroImage} onChange={(event) => setHeroImage(event.target.value)} placeholder="Paste image URL" />
            </div>
          </FormField>

          <FormField label="Internal Notes">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ops or approval notes..." />
          </FormField>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave}>Create Restaurant</Button>
            <Button variant="outline" asChild>
              <Link to="/restaurants">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {heroImage ? <img src={heroImage} alt={name || "Restaurant preview"} className="h-56 w-full rounded-2xl object-cover" /> : null}
          <div>
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
