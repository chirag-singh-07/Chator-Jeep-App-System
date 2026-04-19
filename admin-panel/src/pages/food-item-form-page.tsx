"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { restaurantsSeed, categoriesSeed } from "@/data/dashboard-data";
import type { FoodAddonType } from "@/types/dashboard";

type DraftAddon = {
  id: string;
  name: string;
  type: FoodAddonType;
  price: string;
};

export function FoodItemFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoriesSeed[0]?.name ?? "Burgers");
  const [kitchenId, setKitchenId] = useState(restaurantsSeed[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [foodType, setFoodType] = useState("Veg");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [addonDraft, setAddonDraft] = useState<DraftAddon>({
    id: "draft-addon",
    name: "",
    type: "Drink",
    price: ""
  });
  const [addons, setAddons] = useState<DraftAddon[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !name.trim() ? "Food item name is required." : "";
  const priceError = submitted && !price.trim() ? "Price is required." : "";

  const addAddon = () => {
    if (!addonDraft.name.trim() || !addonDraft.price.trim()) return;
    setAddons((current) => [
      ...current,
      {
        ...addonDraft,
        id: `${addonDraft.type}-${addonDraft.name}-${current.length + 1}`
      }
    ]);
    setAddonDraft({
      id: "draft-addon",
      name: "",
      type: "Drink",
      price: ""
    });
  };

  const onSave = () => {
    setSubmitted(true);
    if (!name.trim() || !price.trim()) return;
    toast.success("Food item created with add-ons.");
    navigate("/food-items");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Add Food Item</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Item Name" error={nameError}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category">
              <Select value={category} onValueChange={setCategory}>
                {categoriesSeed.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
            </FormField>
            <FormField label="Kitchen">
              <Select value={kitchenId} onValueChange={setKitchenId}>
                {restaurantsSeed.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Price" error={priceError}>
              <Input value={price} onChange={(event) => setPrice(event.target.value)} aria-invalid={Boolean(priceError)} />
            </FormField>
            <FormField label="Food Type">
              <Select value={foodType} onValueChange={setFoodType}>
                <SelectItem value="Veg">Veg</SelectItem>
                <SelectItem value="Non-Veg">Non-Veg</SelectItem>
              </Select>
            </FormField>
          </div>

          <FormField label="Image Upload">
            <div className="flex flex-col gap-3">
              <UploadDropzone preview={image} onChange={setImage} />
              <Input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Paste image URL" />
            </div>
          </FormField>

          <FormField label="Description">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormField>

          <FormField label="Add-ons" description="Add optional extras like drinks, fries, dips, desserts, or other extras.">
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.8fr_auto]">
                <Input
                  value={addonDraft.name}
                  onChange={(event) => setAddonDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Addon name"
                />
                <Select
                  value={addonDraft.type}
                  onValueChange={(value) =>
                    setAddonDraft((current) => ({ ...current, type: value as FoodAddonType }))
                  }
                >
                  <SelectItem value="Drink">Drink</SelectItem>
                  <SelectItem value="Side">Side</SelectItem>
                  <SelectItem value="Dip">Dip</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                  <SelectItem value="Extra">Extra</SelectItem>
                </Select>
                <Input
                  value={addonDraft.price}
                  onChange={(event) => setAddonDraft((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Price"
                />
                <Button type="button" variant="outline" onClick={addAddon}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {addons.length ? (
                  addons.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                      onClick={() => setAddons((current) => current.filter((item) => item.id !== addon.id))}
                    >
                      {addon.name} · {addon.type} · Rs {addon.price}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No add-ons added yet.</p>
                )}
              </div>
            </div>
          </FormField>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave}>Create Food Item</Button>
            <Button variant="outline" asChild>
              <Link to="/food-items">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {image ? <img src={image} alt={name || "Food preview"} className="h-56 w-full rounded-2xl object-cover" /> : null}
          <p className="text-xl font-semibold">{name || "Food Item Name"}</p>
          <p className="text-sm text-muted-foreground">{description || "Description preview appears here."}</p>
          <div className="flex flex-wrap gap-2">
            {addons.map((addon) => (
              <span key={addon.id} className="rounded-full bg-muted px-3 py-1 text-xs">
                {addon.name} · {addon.type} · Rs {addon.price}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
