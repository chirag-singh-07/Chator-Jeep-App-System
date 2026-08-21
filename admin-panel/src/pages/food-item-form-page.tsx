import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { adminService } from "@/services/admin.service";
import type { FoodAddonType } from "@/types/dashboard";

type DraftAddon = {
  id: string;
  name: string;
  type: FoodAddonType;
  price: string;
};

export function FoodItemFormPage() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [kitchenId, setKitchenId] = useState("");
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

  useEffect(() => {
    fetchCategories();
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const res = await adminService.getRestaurants({ page: 1 });
      if (res.success && res.restaurants) {
        setRestaurants(res.restaurants);
        if (res.restaurants.length > 0) {
          setKitchenId(res.restaurants[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
      setSubcategory(categories[0].subcategories?.[0] || "");
    }
  }, [categories]);

  const currentCatRecord = categories.find(
    (c) => c.name.toLowerCase() === (category || "").toLowerCase()
  );
  const availableSubcategories = currentCatRecord?.subcategories || [];

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

  const onSave = async () => {
    setSubmitted(true);
    if (!name.trim() || !price.trim()) return;
    if (!kitchenId) {
      toast.error("Please select a target kitchen.");
      return;
    }

    try {
      await adminService.bulkUploadMenuItems(kitchenId, [
        {
          name: name.trim(),
          category: category.trim() || "Main Course",
          subcategory: subcategory.trim() || undefined,
          price: Number(price),
          isVeg: foodType === "Veg",
          imageUrl: image.trim() || undefined,
          description: description.trim() || undefined,
          isAvailable: true,
          showInMenu: true,
          addOns: addons.map((a) => ({ name: a.name, price: Number(a.price) || 0 })),
        },
      ]);
      toast.success("Food item created successfully.");
      navigate("/food-items");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create food item");
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Food Item</CardTitle>
          <Button variant="outline" size="sm" className="rounded-xl border-dashed" asChild>
            <Link to="/food-items/bulk-upload">
              Bulk Upload Multiple Items →
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Item Name" error={nameError}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category">
              <Select
                value={category || categories[0]?.name || "Main Course"}
                onValueChange={(val) => {
                  setCategory(val);
                  const matched = categories.find((c) => c.name === val);
                  setSubcategory(matched?.subcategories?.[0] || "");
                }}
              >
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
            </FormField>

            <FormField label="Subcategory (Optional)">
              {availableSubcategories.length > 0 ? (
                <Select value={subcategory || availableSubcategories[0]} onValueChange={setSubcategory}>
                  {availableSubcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Gourmet (Optional)"
                />
              )}
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Kitchen / Restaurant">
              <Select value={kitchenId} onValueChange={setKitchenId}>
                {restaurants.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.name}
                  </SelectItem>
                ))}
              </Select>
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
