"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/stores/useCategoryStore";

export function CategoryFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { getCategoryById, createCategory, updateCategory, loading } = useCategoryStore();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("0");
  const [submitted, setSubmitted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(mode === "edit");

  const nameError = submitted && !name.trim() ? "Category name is required." : "";

  useEffect(() => {
    const loadCategory = async () => {
      if (mode !== "edit" || !categoryId) {
        setIsInitializing(false);
        return;
      }

      try {
        const category = await getCategoryById(categoryId);
        setName(category.name ?? "");
        setImage(category.image ?? "");
        setDescription(category.description ?? "");
        setSubcategories(category.subcategories ?? []);
        setIsActive(category.isActive ?? true);
        setOrder(String(category.order ?? 0));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Unable to load category.");
        navigate("/categories");
      } finally {
        setIsInitializing(false);
      }
    };

    void loadCategory();
  }, [categoryId, getCategoryById, mode, navigate]);

  const addSubcategory = () => {
    const normalized = subcategoryInput.trim();
    if (!normalized) return;

    setSubcategories((current) => {
      if (current.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
        return current;
      }

      return [...current, normalized];
    });
    setSubcategoryInput("");
  };

  const saveCategory = async () => {
    setSubmitted(true);
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      image: image.trim() || undefined,
      description: description.trim() || undefined,
      subcategories,
      isActive,
      order: Number(order) || 0,
    };

    try {
      if (mode === "create") {
        await createCategory(payload);
        toast.success("Category created.");
      } else if (categoryId) {
        await updateCategory(categoryId, payload);
        toast.success("Category updated.");
      }

      navigate("/categories");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to save category.");
    }
  };

  if (isInitializing) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Loading Category</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Fetching category details for editing.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>{mode === "create" ? "Add Category" : "Edit Category"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FormField label="Category Name" error={nameError}>
            <Input value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} />
          </FormField>

          <FormField label="Image Upload" description="Drag and drop for preview or paste a hosted image URL below.">
            <div className="flex flex-col gap-3">
              <UploadDropzone preview={image} onChange={setImage} />
              <Input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Paste image URL" />
            </div>
          </FormField>

          <FormField label="Description" description="Optional context for operators browsing the catalog.">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormField>

          <FormField label="Subcategories" description="Add and remove subcategories inline for a scalable taxonomy.">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input value={subcategoryInput} onChange={(event) => setSubcategoryInput(event.target.value)} placeholder="Type a subcategory" />
                <Button type="button" variant="outline" onClick={addSubcategory}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                    onClick={() => setSubcategories((current) => current.filter((item) => item !== subcategory))}
                  >
                    {subcategory}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Sort Order" description="Lower numbers appear earlier in category lists.">
              <Input value={order} onChange={(event) => setOrder(event.target.value)} placeholder="0" inputMode="numeric" />
            </FormField>

            <FormField label="Visibility" description="Inactive categories stay hidden from active listings.">
              <Button type="button" variant={isActive ? "default" : "outline"} onClick={() => setIsActive((current) => !current)}>
                {isActive ? "Active" : "Inactive"}
              </Button>
            </FormField>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveCategory} disabled={loading}>
              {mode === "create" ? "Create Category" : "Save Changes"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/categories">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {image ? <img src={image} alt={name || "Preview"} className="h-56 w-full rounded-2xl object-cover" /> : null}
          <div>
            <p className="text-xl font-semibold">{name || "Category name"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description || "Description preview appears here."}</p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Status: {isActive ? "Active" : "Inactive"} | Sort order: {Number(order) || 0}
          </div>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((subcategory) => (
              <span key={subcategory} className="rounded-full bg-muted px-3 py-1 text-xs">
                {subcategory}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
