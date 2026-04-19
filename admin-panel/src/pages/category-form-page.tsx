"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { UploadDropzone } from "@/components/admin/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { categoriesSeed } from "@/data/dashboard-data";

export function CategoryFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const existing = useMemo(() => categoriesSeed.find((category) => category.id === categoryId), [categoryId]);

  const [name, setName] = useState(existing?.name ?? "");
  const [image, setImage] = useState(existing?.image ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [subcategories, setSubcategories] = useState(existing?.subcategories ?? []);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !name.trim() ? "Category name is required." : "";
  const imageError = submitted && !image.trim() ? "An image or preview is required." : "";

  const addSubcategory = () => {
    if (!subcategoryInput.trim()) return;
    setSubcategories((current) => [...current, subcategoryInput.trim()]);
    setSubcategoryInput("");
  };

  const saveCategory = () => {
    setSubmitted(true);
    if (!name.trim() || !image.trim()) return;
    toast.success(mode === "create" ? "Category created." : "Category updated.");
    navigate("/categories");
  };

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

          <FormField label="Image Upload" description="Drag and drop for preview or paste a hosted image URL below." error={imageError}>
            <div className="flex flex-col gap-3">
              <UploadDropzone preview={image} onChange={setImage} />
              <Input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Paste image URL" aria-invalid={Boolean(imageError)} />
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

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveCategory}>{mode === "create" ? "Create Category" : "Save Changes"}</Button>
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
