"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  RefreshCw,
  Utensils,
  Store,
  Check,
  X,
  Search,
  Flame,
  Star,
  Leaf,
  Clock,
  Zap,
  RotateCcw,
  Eraser,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { adminService } from "@/services/admin.service";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface BulkMenuItemDraft {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string | number;
  discountPrice?: string | number;
  isVeg: boolean;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  portionSize?: string;
  preparationTimeMins?: string | number;
  calories?: string | number;
  ingredients?: string;
  allergens?: string;
  isBestseller?: boolean;
  isSpicy?: boolean;
  isJain?: boolean;
  isRecommended?: boolean;
  variantsText?: string;
  addonsText?: string;
  // UI validation
  errors?: string[];
  isValid?: boolean;
  isUploadingImage?: boolean;
}

const SAMPLE_TEMPLATE_DATA = [
  {
    "Name *": "Crispy Veg Maharaja Burger",
    "Category *": "Burgers",
    "Subcategory": "Gourmet Burgers",
    "Price *": 179,
    "Discount Price": 149,
    "Is Veg (Yes/No)": "Yes",
    "Image URL": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "Short Description": "Crunchy herb potato patty with secret spicy sauce",
    "Full Description": "Double decker crispy veggie burger layered with fresh lettuce, sliced tomatoes, gherkins and special cheese sauce.",
    "Prep Time (Mins)": 15,
    "Calories": 480,
    "Ingredients (comma separated)": "Potato, Peas, Cheese, Special Mayo, Sesame Bun",
    "Allergens (comma separated)": "Gluten, Dairy",
    "Is Bestseller (Yes/No)": "Yes",
    "Is Spicy (Yes/No)": "No",
    "Is Jain (Yes/No)": "No",
    "Is Recommended (Yes/No)": "Yes",
    "Variants (Name:Price)": "Regular:149, Double Patty:199",
    "Addons (Name:Price)": "Extra Cheese Slice:25, Peri Peri Dip:30",
  },
  {
    "Name *": "Paneer Tikka Stuffed Garlic Bread",
    "Category *": "Starters",
    "Subcategory": "Breads",
    "Price *": 199,
    "Discount Price": 179,
    "Is Veg (Yes/No)": "Yes",
    "Image URL": "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600",
    "Short Description": "Freshly baked garlic bread filled with tandoori paneer",
    "Full Description": "Artisanal garlic loaf stuffed with smoked tandoori paneer cubes, mozzarella cheese and fresh coriander.",
    "Prep Time (Mins)": 20,
    "Calories": 520,
    "Ingredients (comma separated)": "Paneer, Mozzarella, Garlic Butter, Oregano",
    "Allergens (comma separated)": "Dairy, Gluten",
    "Is Bestseller (Yes/No)": "Yes",
    "Is Spicy (Yes/No)": "Yes",
    "Is Jain (Yes/No)": "No",
    "Is Recommended (Yes/No)": "Yes",
    "Variants (Name:Price)": "4 Pieces:179, 8 Pieces:299",
    "Addons (Name:Price)": "Cheese Jalapeno Dip:35",
  },
  {
    "Name *": "Classic Margherita Pizza (10 inch)",
    "Category *": "Pizzas",
    "Subcategory": "Thin Crust",
    "Price *": 299,
    "Discount Price": 249,
    "Is Veg (Yes/No)": "Yes",
    "Image URL": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600",
    "Short Description": "San Marzano tomato base with 100% real mozzarella and basil",
    "Full Description": "Traditional hand-tossed 10-inch sourdough pizza topped with aromatic Italian herbs, extra virgin olive oil and fresh basil leaves.",
    "Prep Time (Mins)": 22,
    "Calories": 650,
    "Ingredients (comma separated)": "Pizza Dough, San Marzano Sauce, Mozzarella, Fresh Basil",
    "Allergens (comma separated)": "Dairy, Gluten",
    "Is Bestseller (Yes/No)": "No",
    "Is Spicy (Yes/No)": "No",
    "Is Jain (Yes/No)": "Yes",
    "Is Recommended (Yes/No)": "Yes",
    "Variants (Name:Price)": "Regular Crust:249, Cheese Burst:329",
    "Addons (Name:Price)": "Extra Mozzarella:45, Black Olives:30",
  },
  {
    "Name *": "Belgian Dark Chocolate Thickshake",
    "Category *": "Beverages",
    "Subcategory": "Shakes",
    "Price *": 159,
    "Discount Price": 139,
    "Is Veg (Yes/No)": "Yes",
    "Image URL": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
    "Short Description": "Rich 70% dark chocolate shake with chocolate chips",
    "Full Description": "Creamy thickshake blended with rich Belgian dark chocolate gelato, topped with whipped cream and cocoa shavings.",
    "Prep Time (Mins)": 10,
    "Calories": 390,
    "Ingredients (comma separated)": "Milk, Dark Chocolate Gelato, Cocoa, Chocolate Chips",
    "Allergens (comma separated)": "Dairy",
    "Is Bestseller (Yes/No)": "Yes",
    "Is Spicy (Yes/No)": "No",
    "Is Jain (Yes/No)": "Yes",
    "Is Recommended (Yes/No)": "Yes",
    "Variants (Name:Price)": "300ml:139, 500ml:199",
    "Addons (Name:Price)": "Whipped Cream:20, Extra Choco Chips:20",
  },
];

export function BulkMenuUploadPage() {
  const [searchParams] = useSearchParams();
  const preselectedRestaurantId = searchParams.get("restaurantId") || "";

  // Restaurants & Categories data
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(preselectedRestaurantId);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const { categories, fetchCategories } = useCategoryStore();

  // Active Tab: "form" (default) or "file"
  const [activeTab, setActiveTab] = useState<"form" | "file">("form");

  // File upload state
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft Items State for the entry form
  const [items, setItems] = useState<BulkMenuItemDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Existing Menu Items for selected restaurant (Bottom Table)
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loadingExistingItems, setLoadingExistingItems] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [tableCategory, setTableCategory] = useState("all");
  const [tableType, setTableType] = useState<"all" | "veg" | "non-veg">("all");

  // Create clean empty item
  const createEmptyItem = (): BulkMenuItemDraft => ({
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: "",
    category: categories[0]?.name || "Main Course",
    subcategory: "",
    price: "",
    discountPrice: "",
    isVeg: true,
    imageUrl: "",
    shortDescription: "",
    description: "",
    preparationTimeMins: "15",
    calories: "",
    ingredients: "",
    allergens: "",
    isBestseller: false,
    isSpicy: false,
    isJain: false,
    isRecommended: false,
    variantsText: "",
    addonsText: "",
    errors: [],
    isValid: false,
  });

  // Validate a single draft item
  const validateItem = (item: BulkMenuItemDraft): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!item.name || !item.name.trim()) {
      errors.push("Dish name is required.");
    }
    const priceNum = Number(item.price);
    if (item.price === "" || isNaN(priceNum) || priceNum < 0) {
      errors.push("Valid regular price (≥ 0) is required.");
    }
    if (item.discountPrice !== undefined && item.discountPrice !== "") {
      const discNum = Number(item.discountPrice);
      if (isNaN(discNum) || discNum < 0) {
        errors.push("Discount price must be a valid number.");
      } else if (!isNaN(priceNum) && discNum > priceNum) {
        errors.push("Discount price cannot exceed regular price.");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Load restaurants & categories on mount
  useEffect(() => {
    fetchCategories();
    loadRestaurants();
    setItems([createEmptyItem()]);
  }, []);

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const res = await adminService.getRestaurants({ page: 1 });
      if (res.success && res.restaurants) {
        setRestaurants(res.restaurants);
        if (!selectedRestaurantId && res.restaurants.length > 0) {
          setSelectedRestaurantId(res.restaurants[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      toast.error("Failed to load restaurant list");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const selectedRestaurant = restaurants.find((r) => r._id === selectedRestaurantId);

  // Fetch live menu items whenever selected restaurant changes
  const fetchLiveMenuItems = async () => {
    if (!selectedRestaurantId) return;
    setLoadingExistingItems(true);
    try {
      const res = await adminService.getMenuItems({
        restaurantId: selectedRestaurantId,
        limit: 200,
      });
      setExistingItems(res.items || []);
    } catch (error) {
      console.error("Failed to fetch restaurant menu items:", error);
    } finally {
      setLoadingExistingItems(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchLiveMenuItems();
    }
  }, [selectedRestaurantId]);

  // ==========================================
  // TEMPLATE DOWNLOAD
  // ==========================================
  const handleDownloadTemplate = (format: "xlsx" | "csv" = "xlsx") => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_DATA);
      const colWidths = [
        { wch: 32 },
        { wch: 18 },
        { wch: 18 },
        { wch: 10 },
        { wch: 14 },
        { wch: 16 },
        { wch: 45 },
        { wch: 40 },
        { wch: 50 },
        { wch: 16 },
        { wch: 12 },
        { wch: 40 },
        { wch: 25 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
        { wch: 35 },
        { wch: 35 },
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Menu_Template");

      const fileName = `Chatori_Jeeb_Menu_Bulk_Template.${format}`;
      XLSX.writeFile(workbook, fileName, { bookType: format });
      toast.success(`Template downloaded: ${fileName}`);
    } catch (error) {
      console.error("Failed to generate template:", error);
      toast.error("Failed to download template");
    }
  };

  // ==========================================
  // EXCEL / CSV PARSING
  // ==========================================
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    setUploadedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rawJson || rawJson.length === 0) {
        toast.error("The uploaded file is empty. Please check your data.");
        setIsParsingFile(false);
        return;
      }

      const parsedItems: BulkMenuItemDraft[] = rawJson.map((row: any, index: number) => {
        const getVal = (...keys: string[]) => {
          for (const key of keys) {
            for (const rowKey of Object.keys(row)) {
              if (rowKey.trim().toLowerCase() === key.toLowerCase()) {
                return row[rowKey];
              }
            }
          }
          return "";
        };

        const name = String(getVal("name *", "name", "item name", "dish name")).trim();
        const category = String(getVal("category *", "category", "cat")).trim() || "Main Course";
        const subcategory = String(getVal("subcategory", "sub category", "sub-category")).trim();
        const price = getVal("price *", "price", "rate", "cost");
        const discountPrice = getVal("discount price", "discount_price", "discountprice", "offer price");

        const vegRaw = String(getVal("is veg (yes/no)", "is veg", "isveg", "veg", "type")).trim().toLowerCase();
        const isVeg =
          vegRaw === "yes" ||
          vegRaw === "veg" ||
          vegRaw === "true" ||
          vegRaw === "1" ||
          vegRaw === "vegetarian";

        const imageUrl = String(getVal("image url", "image", "imageurl", "photo", "img")).trim();
        const shortDescription = String(getVal("short description", "shortdescription", "summary")).trim();
        const description = String(getVal("full description", "description", "details")).trim();
        const portionSize = String(getVal("portion size", "portionsize", "size", "serving")).trim();
        const preparationTimeMins = getVal("prep time (mins)", "prep time", "preparation time", "time");
        const calories = getVal("calories", "cals");
        const ingredients = String(getVal("ingredients (comma separated)", "ingredients", "ing")).trim();
        const allergens = String(getVal("allergens (comma separated)", "allergens")).trim();

        const isBestseller = ["yes", "true", "1"].includes(
          String(getVal("is bestseller (yes/no)", "is bestseller", "bestseller")).trim().toLowerCase()
        );
        const isSpicy = ["yes", "true", "1"].includes(
          String(getVal("is spicy (yes/no)", "is spicy", "spicy")).trim().toLowerCase()
        );
        const isJain = ["yes", "true", "1"].includes(
          String(getVal("is jain (yes/no)", "is jain", "jain")).trim().toLowerCase()
        );
        const isRecommended = ["yes", "true", "1"].includes(
          String(getVal("is recommended (yes/no)", "is recommended", "recommended")).trim().toLowerCase()
        );

        const variantsText = String(getVal("variants (name:price)", "variants", "variant")).trim();
        const addonsText = String(getVal("addons (name:price)", "addons", "add-ons", "addon")).trim();

        const draft: BulkMenuItemDraft = {
          id: `item-upload-${index}-${Date.now()}`,
          name,
          category,
          subcategory,
          price,
          discountPrice,
          isVeg,
          imageUrl,
          shortDescription,
          description,
          portionSize,
          preparationTimeMins,
          calories,
          ingredients,
          allergens,
          isBestseller,
          isSpicy,
          isJain,
          isRecommended,
          variantsText,
          addonsText,
        };

        const validation = validateItem(draft);
        draft.isValid = validation.isValid;
        draft.errors = validation.errors;

        return draft;
      });

      setItems(parsedItems);
      setActiveTab("form");
      const validCnt = parsedItems.filter((i) => i.isValid).length;
      const errorCnt = parsedItems.length - validCnt;

      if (errorCnt > 0) {
        toast.warning(`Loaded ${parsedItems.length} items (${validCnt} valid, ${errorCnt} need review)`);
      } else {
        toast.success(`Loaded ${parsedItems.length} menu items into form ready for review!`);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to parse file. Please verify column format.");
    } finally {
      setIsParsingFile(false);
    }
  };

  // ==========================================
  // IMAGE UPLOAD HELPER
  // ==========================================
  const handleRowImageUpload = async (index: number, file: File) => {
    if (!file) return;

    setItems((curr) =>
      curr.map((item, idx) => (idx === index ? { ...item, isUploadingImage: true } : item))
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "menu-items");
      formData.append("profiles", "full");

      const response = await apiClient.post("/uploads/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const urls = response.data?.data?.urls;
      const uploadedUrl = urls?.full || urls?.medium || urls?.default || Object.values(urls || {})[0];

      if (uploadedUrl && typeof uploadedUrl === "string") {
        updateItem(index, { imageUrl: uploadedUrl });
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Could not retrieve uploaded image URL");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast.error(err?.response?.data?.message || "Image upload failed. Please try again.");
    } finally {
      setItems((curr) =>
        curr.map((item, idx) => (idx === index ? { ...item, isUploadingImage: false } : item))
      );
    }
  };

  // Update item field
  const updateItem = (index: number, updates: Partial<BulkMenuItemDraft>) => {
    setItems((curr) => {
      const next = [...curr];
      const updated = { ...next[index], ...updates };
      const validation = validateItem(updated);
      updated.isValid = validation.isValid;
      updated.errors = validation.errors;
      next[index] = updated;
      return next;
    });
  };

  // Add row
  const handleAddRow = () => {
    setItems((curr) => [...curr, createEmptyItem()]);
  };

  // Duplicate row
  const handleDuplicateRow = (index: number) => {
    setItems((curr) => {
      const source = curr[index];
      const duplicated: BulkMenuItemDraft = {
        ...source,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${source.name} (Copy)`,
      };
      const validation = validateItem(duplicated);
      duplicated.isValid = validation.isValid;
      duplicated.errors = validation.errors;
      const next = [...curr];
      next.splice(index + 1, 0, duplicated);
      return next;
    });
    toast.success("Dish duplicated");
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    if (items.length <= 1) {
      setItems([createEmptyItem()]);
    } else {
      setItems((curr) => curr.filter((_, idx) => idx !== index));
    }
  };

  // Clear / Reset Form with intelligent confirmation
  const handleClearAll = () => {
    const hasData = items.some(
      (i) => i.name.trim() || i.price !== "" || i.imageUrl || i.shortDescription || i.description
    );

    if (hasData) {
      if (!window.confirm("Are you sure you want to clear all form entries? Any unsaved dish details will be reset.")) {
        return;
      }
    }

    setItems([createEmptyItem()]);
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Form has been reset to an empty dish.");
  };

  // Reset single dish fields
  const handleResetSingleDish = (index: number) => {
    setItems((curr) => {
      const next = [...curr];
      next[index] = {
        ...createEmptyItem(),
        id: next[index].id,
      };
      return next;
    });
    toast.info(`Dish #${index + 1} cleared.`);
  };

  // ==========================================
  // SUBMIT & AUTO-REFRESH BOTTOM TABLE
  // ==========================================
  const handleBulkSubmit = async () => {
    if (!selectedRestaurantId) {
      toast.error("Please select a target restaurant first.");
      return;
    }

    if (items.length === 0) {
      toast.error("No menu items to upload.");
      return;
    }

    const invalidItems = items.filter((i) => !i.isValid);
    if (invalidItems.length > 0) {
      toast.error(
        `Cannot upload: ${invalidItems.length} dish(es) have missing required fields. Please fill in the Dish Name and Price.`
      );
      return;
    }

    const formattedPayload = items.map((item) => {
      let variants: { name: string; price: number }[] = [];
      if (item.variantsText) {
        variants = item.variantsText
          .split(",")
          .map((v) => {
            const [vName, vPrice] = v.split(":");
            return {
              name: (vName || "").trim(),
              price: Number((vPrice || "").trim()) || 0,
            };
          })
          .filter((v) => v.name);
      }

      let addOns: { name: string; price: number; imageUrl?: string }[] = [];
      if (item.addonsText) {
        addOns = item.addonsText
          .split(",")
          .map((a) => {
            const [aName, aPrice] = a.split(":");
            return {
              name: (aName || "").trim(),
              price: Number((aPrice || "").trim()) || 0,
            };
          })
          .filter((a) => a.name);
      }

      return {
        name: item.name.trim(),
        category: item.category?.trim() || "Main Course",
        subcategory: item.subcategory?.trim() || undefined,
        price: Number(item.price),
        discountPrice:
          item.discountPrice !== undefined && item.discountPrice !== ""
            ? Number(item.discountPrice)
            : undefined,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl?.trim() || undefined,
        shortDescription: item.shortDescription?.trim() || undefined,
        description: item.description?.trim() || undefined,
        portionSize: item.portionSize?.trim() || undefined,
        preparationTimeMins:
          item.preparationTimeMins !== "" && !isNaN(Number(item.preparationTimeMins))
            ? Number(item.preparationTimeMins)
            : undefined,
        calories:
          item.calories !== "" && !isNaN(Number(item.calories)) ? Number(item.calories) : undefined,
        ingredients: item.ingredients
          ? item.ingredients.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
        allergens: item.allergens
          ? item.allergens.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
        tags: {
          isBestseller: Boolean(item.isBestseller),
          isSpicy: Boolean(item.isSpicy),
          isJain: Boolean(item.isJain),
          isRecommended: Boolean(item.isRecommended),
        },
        variants,
        addOns,
        isAvailable: true,
        showInMenu: true,
      };
    });

    setIsSubmitting(true);
    try {
      const response = await adminService.bulkUploadMenuItems(selectedRestaurantId, formattedPayload);
      if (response.success) {
        const count = response.count || items.length;
        toast.success(
          `🎉 Successfully added ${count} item${count > 1 ? "s" : ""} to ${
            selectedRestaurant?.name || "the restaurant"
          }!`
        );

        // Reset form ready for next batch without reload!
        setItems([createEmptyItem()]);
        setUploadedFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Instantly refresh the bottom table!
        await fetchLiveMenuItems();
      } else {
        toast.error(response.message || "Failed to upload menu items.");
      }
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to upload menu items. Please check your data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // BOTTOM TABLE ACTIONS
  // ==========================================
  const handleDeleteExistingItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    try {
      await adminService.deleteMenuItem(itemId);
      toast.success(`Deleted "${itemName}"`);
      setExistingItems((curr) => curr.filter((i) => i._id !== itemId));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete item");
    }
  };

  const handleToggleStock = async (itemId: string, currentStock: boolean) => {
    try {
      await adminService.toggleMenuItemStock(itemId, !currentStock);
      toast.success(!currentStock ? "Marked In Stock" : "Marked Out of Stock");
      setExistingItems((curr) =>
        curr.map((i) => (i._id === itemId ? { ...i, isAvailable: !currentStock } : i))
      );
    } catch (error: any) {
      toast.error("Failed to update item availability");
    }
  };

  // Filter bottom table items
  const filteredExistingItems = useMemo(() => {
    return existingItems.filter((item) => {
      const matchesSearch =
        !tableSearch ||
        item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.category?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.shortDescription?.toLowerCase().includes(tableSearch.toLowerCase());

      const matchesCat = tableCategory === "all" || item.category === tableCategory;

      const matchesType =
        tableType === "all" ||
        (tableType === "veg" && item.isVeg) ||
        (tableType === "non-veg" && !item.isVeg);

      return matchesSearch && matchesCat && matchesType;
    });
  }, [existingItems, tableSearch, tableCategory, tableType]);

  const validCount = items.filter((i) => i.isValid).length;
  const errorCount = items.length - validCount;

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-7xl mx-auto w-full">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-10 rounded-2xl shadow-xs" asChild>
            <Link to="/food-items">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Add Menu Items</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Add food items for any kitchen with spacious form inputs, live image upload, and an auto-refreshing menu table.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-dashed shadow-xs h-10 px-4 font-semibold"
            onClick={() => handleDownloadTemplate("xlsx")}
          >
            <Download className="mr-2 size-4 text-emerald-600" />
            Download Excel Template (.xlsx)
          </Button>
        </div>
      </div>

      {/* ── Step 1: Restaurant Selector Card ────────────────────── */}
      <Card className="rounded-3xl border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
                <Store className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Step 1: Select Target Kitchen / Restaurant</CardTitle>
                <CardDescription className="text-xs">
                  Choose which kitchen will receive the dishes you add below.
                </CardDescription>
              </div>
            </div>
            {selectedRestaurant && (
              <Badge variant="secondary" className="font-semibold px-3 py-1 rounded-xl">
                Status: {selectedRestaurant.status || "ACTIVE"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Kitchen / Restaurant *
              </label>
              {loadingRestaurants ? (
                <div className="flex h-11 items-center gap-2 rounded-2xl border bg-muted/40 px-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading kitchens...
                </div>
              ) : (
                <Select
                  value={selectedRestaurantId}
                  onValueChange={setSelectedRestaurantId}
                  className="h-11"
                >
                  {restaurants.map((rest) => (
                    <SelectItem key={rest._id} value={rest._id}>
                      {rest.name} {rest.phone ? `(${rest.phone})` : ""} - {rest.address?.city || "Active"}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>

            {selectedRestaurant && (
              <div className="flex flex-col justify-center rounded-2xl bg-muted/40 p-4 text-xs border">
                <p className="font-bold text-sm text-foreground">{selectedRestaurant.name}</p>
                <p className="text-muted-foreground mt-0.5">
                  {selectedRestaurant.address?.line1 || "No address"}, {selectedRestaurant.address?.city || ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-background text-[11px] font-semibold rounded-lg">
                    Current Menu: <strong className="ml-1 text-primary">{existingItems.length}</strong> items
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Step 2: Upload Method Tabs ─────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "form" | "file")} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-12 rounded-2xl bg-muted/60 p-1">
            <TabsTrigger value="form" className="rounded-xl px-5 font-bold data-[state=active]:shadow-xs text-sm">
              <Sparkles className="mr-2 size-4 text-primary" />
              Menu Item Form Entry
            </TabsTrigger>
            <TabsTrigger value="file" className="rounded-xl px-5 font-bold data-[state=active]:shadow-xs text-sm">
              <FileSpreadsheet className="mr-2 size-4 text-emerald-600" />
              Import via Excel / CSV File
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Form Queue: <strong className="text-foreground">{items.length}</strong> dish(es)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
              <Check className="size-3" /> {validCount} Ready
            </span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                <AlertTriangle className="size-3" /> {errorCount} Incomplete
              </span>
            )}
            
            {/* Top Quick Reset Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all h-8 px-3"
              onClick={handleClearAll}
            >
              <RotateCcw className="mr-1.5 size-3" />
              Reset Form
            </Button>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TAB 1: SPACIOUS CARD-BASED FORM ENTRY
           ────────────────────────────────────────────────────────── */}
        <TabsContent value="form" className="mt-4 flex flex-col gap-6">
          {items.map((item, index) => {
            const hasError = !item.isValid && item.name.trim().length > 0;

            return (
              <Card
                key={item.id}
                className={cn(
                  "rounded-3xl border shadow-sm transition-all overflow-hidden",
                  hasError ? "border-destructive/40 bg-destructive/5" : "border-border/80 bg-card hover:border-primary/30"
                )}
              >
                {/* Dish Card Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        {item.name ? item.name : `New Dish Item #${index + 1}`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.category || "Uncategorized"} · {item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-8"
                      onClick={() => handleDuplicateRow(index)}
                    >
                      <Copy className="mr-1.5 size-3.5" />
                      Duplicate
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleResetSingleDish(index)}
                      title="Clear fields for this dish"
                    >
                      <Eraser className="mr-1.5 size-3.5" />
                      Clear Dish
                    </Button>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-xs h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <Trash2 className="mr-1.5 size-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dish Card Body (2-Column Form Layout) */}
                <CardContent className="p-6">
                  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    {/* ── Left Column: Primary Details ──────── */}
                    <div className="flex flex-col gap-4">
                      {/* Dish Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                          <span>Dish Name <strong className="text-destructive">*</strong></span>
                          {!item.name.trim() && (
                            <span className="text-[11px] font-normal text-amber-600">Required</span>
                          )}
                        </label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          placeholder="e.g. Double Cheese Paneer Burger"
                          className="h-11 text-base font-semibold rounded-2xl"
                        />
                      </div>

                      {/* Category & Subcategory */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Category *
                          </label>
                          <div className="relative">
                            <input
                              list={`categories-list-${item.id}`}
                              value={item.category}
                              onChange={(e) => updateItem(index, { category: e.target.value })}
                              placeholder="Select or type category"
                              className="h-11 w-full rounded-2xl border bg-background px-3.5 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                            />
                            <datalist id={`categories-list-${item.id}`}>
                              {categories.map((c) => (
                                <option key={c.id} value={c.name} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Subcategory (Optional)
                          </label>
                          <Input
                            value={item.subcategory || ""}
                            onChange={(e) => updateItem(index, { subcategory: e.target.value })}
                            placeholder="e.g. Gourmet, Thin Crust"
                            className="h-11 text-sm rounded-2xl"
                          />
                        </div>
                      </div>

                      {/* Price, Discount & Food Type */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Price (₹) <strong className="text-destructive">*</strong>
                          </label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, { price: e.target.value })}
                            placeholder="e.g. 199"
                            className="h-11 text-base font-bold rounded-2xl"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Discount Price (₹)
                          </label>
                          <Input
                            type="number"
                            value={item.discountPrice ?? ""}
                            onChange={(e) => updateItem(index, { discountPrice: e.target.value })}
                            placeholder="Optional"
                            className="h-11 text-sm rounded-2xl"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Food Type
                          </label>
                          <div className="flex h-11 items-center gap-1 rounded-2xl border bg-muted/30 p-1">
                            <button
                              type="button"
                              onClick={() => updateItem(index, { isVeg: true })}
                              className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition",
                                item.isVeg
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <span className="size-2 rounded-full bg-white" />
                              Veg
                            </button>
                            <button
                              type="button"
                              onClick={() => updateItem(index, { isVeg: false })}
                              className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition",
                                !item.isVeg
                                  ? "bg-rose-500 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <span className="size-2 rounded-full bg-white" />
                              Non-Veg
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Prep Time & Calories */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                            <Clock className="size-3.5 text-muted-foreground" /> Prep Time (Mins)
                          </label>
                          <Input
                            type="number"
                            value={item.preparationTimeMins ?? "15"}
                            onChange={(e) => updateItem(index, { preparationTimeMins: e.target.value })}
                            placeholder="15"
                            className="h-11 text-sm rounded-2xl"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                            <Zap className="size-3.5 text-muted-foreground" /> Calories (kcal)
                          </label>
                          <Input
                            type="number"
                            value={item.calories ?? ""}
                            onChange={(e) => updateItem(index, { calories: e.target.value })}
                            placeholder="e.g. 450"
                            className="h-11 text-sm rounded-2xl"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Description
                        </label>
                        <Textarea
                          value={item.shortDescription || item.description || ""}
                          onChange={(e) =>
                            updateItem(index, {
                              shortDescription: e.target.value,
                              description: e.target.value,
                            })
                          }
                          placeholder="Short mouth-watering description of ingredients, taste, and special preparation..."
                          className="min-h-20 text-sm rounded-2xl"
                        />
                      </div>

                      {/* Tags / Badges */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Dish Tags & Highlights
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateItem(index, { isBestseller: !item.isBestseller })}
                            className={cn(
                              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                              item.isBestseller
                                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Star className="size-3.5" />
                            Bestseller
                          </button>

                          <button
                            type="button"
                            onClick={() => updateItem(index, { isSpicy: !item.isSpicy })}
                            className={cn(
                              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                              item.isSpicy
                                ? "bg-red-500 text-white border-red-600 shadow-xs"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Flame className="size-3.5" />
                            Spicy
                          </button>

                          <button
                            type="button"
                            onClick={() => updateItem(index, { isJain: !item.isJain })}
                            className={cn(
                              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                              item.isJain
                                ? "bg-green-600 text-white border-green-700 shadow-xs"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Leaf className="size-3.5" />
                            Jain Friendly
                          </button>

                          <button
                            type="button"
                            onClick={() => updateItem(index, { isRecommended: !item.isRecommended })}
                            className={cn(
                              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                              item.isRecommended
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-muted/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Sparkles className="size-3.5" />
                            Recommended
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Right Column: Image Upload Box ──────── */}
                    <div className="flex flex-col gap-3 rounded-3xl border bg-muted/20 p-5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Dish Photo</span>
                        {item.imageUrl && (
                          <button
                            type="button"
                            onClick={() => updateItem(index, { imageUrl: "" })}
                            className="text-[11px] font-semibold text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </label>

                      {/* Big Dropzone & Preview Box */}
                      <div
                        className={cn(
                          "relative flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-background p-6 text-center transition overflow-hidden",
                          "hover:border-primary hover:bg-primary/5",
                          item.isUploadingImage && "opacity-70 pointer-events-none"
                        )}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRowImageUpload(index, file);
                          }}
                        />

                        {item.isUploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-xs font-bold text-primary">Uploading Image to Server...</p>
                          </div>
                        ) : item.imageUrl ? (
                          <div className="relative size-full flex flex-col items-center justify-center">
                            <img
                              src={item.imageUrl}
                              alt={item.name || "Dish Preview"}
                              className="max-h-48 w-full rounded-xl object-cover shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <p className="mt-2 text-[11px] text-muted-foreground">Click or drop to replace image</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Upload className="size-6" />
                            </div>
                            <p className="text-sm font-bold text-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">or drag and drop file here</p>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                              WebP, JPG, PNG (Max 5MB)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Image URL Input Option */}
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">Or paste direct image URL:</span>
                        <Input
                          value={item.imageUrl || ""}
                          onChange={(e) => updateItem(index, { imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="h-10 text-xs rounded-xl bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* ── Form Action Controls Bar (Add Another Dish, Clear Form & Submit) ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleAddRow}
                className="rounded-2xl font-bold h-12 px-6 shadow-xs border-primary/30 hover:bg-primary/5 hover:border-primary"
              >
                <Plus className="mr-2 size-5 text-primary" />
                Add Another Dish Card
              </Button>

              {/* Enhanced Clear / Reset Form Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClearAll}
                className="group rounded-2xl border-destructive/25 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 font-bold h-12 px-5 transition-all shadow-xs"
              >
                <RotateCcw className="mr-2 size-4 text-destructive/70 transition-transform duration-300 group-hover:-rotate-90 group-hover:text-destructive" />
                Clear / Reset Form
              </Button>
            </div>

            <Button
              type="button"
              size="lg"
              className="rounded-2xl font-black h-12 px-8 shadow-md text-base transition-all"
              onClick={handleBulkSubmit}
              disabled={isSubmitting || validCount === 0 || errorCount > 0 || !selectedRestaurantId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Submitting {validCount} Dish{validCount > 1 ? "es" : ""}...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-5" />
                  Submit & Add {validCount} Dish{validCount > 1 ? "es" : ""} to Menu
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ──────────────────────────────────────────────────────────
            TAB 2: EXCEL FILE UPLOAD
           ────────────────────────────────────────────────────────── */}
        <TabsContent value="file" className="mt-4 flex flex-col gap-4">
          <Card className="rounded-3xl border-dashed shadow-xs">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                id="excel-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                {isParsingFile ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-8" />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold">
                  {uploadedFileName ? uploadedFileName : "Drag & Drop or Select Your Excel / CSV File"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports standard Excel worksheets (.xlsx, .xls) and comma-separated (.csv) files.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Button
                  type="button"
                  size="lg"
                  className="rounded-2xl font-bold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingFile}
                >
                  <Upload className="mr-2 size-4" />
                  {uploadedFileName ? "Choose Another File" : "Browse File on Computer"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => handleDownloadTemplate("xlsx")}
                >
                  <Download className="mr-2 size-4" />
                  Download Sample Template (.xlsx)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Step 3: LIVE RESTAURANT MENU ITEMS TABLE (BOTTOM) ─────── */}
      <Card className="rounded-3xl shadow-sm border mt-6">
        <CardHeader className="border-b pb-5 px-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold shadow-xs">
                <Utensils className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Live Menu for {selectedRestaurant?.name || "Selected Kitchen"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {existingItems.length} active dishes currently in the database. Instantly refreshes when you add dishes above.
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLiveMenuItems}
              disabled={loadingExistingItems}
              className="rounded-xl shadow-xs"
            >
              <RefreshCw className={cn("mr-1.5 size-3.5", loadingExistingItems && "animate-spin")} />
              Refresh Table
            </Button>
          </div>

          {/* Table Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu dishes..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="h-10 pl-9 text-xs rounded-xl"
              />
            </div>

            <div className="w-44">
              <Select value={tableCategory} onValueChange={setTableCategory} className="h-10">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setTableType("all")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  tableType === "all" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTableType("veg")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  tableType === "veg" ? "bg-emerald-500 text-white shadow-xs" : "text-muted-foreground"
                )}
              >
                Veg
              </button>
              <button
                type="button"
                onClick={() => setTableType("non-veg")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  tableType === "non-veg" ? "bg-rose-500 text-white shadow-xs" : "text-muted-foreground"
                )}
              >
                Non-Veg
              </button>
            </div>
          </div>
        </CardHeader>

        {loadingExistingItems ? (
          <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading menu items...
          </div>
        ) : filteredExistingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Utensils className="size-10 text-muted-foreground/30" />
            <p className="text-base font-bold text-muted-foreground">
              {existingItems.length === 0
                ? "No menu items added yet for this kitchen."
                : "No menu items match your search filter."}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Fill in the form above and click "Submit & Add to Menu".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 w-16">Photo</th>
                  <th className="p-3.5 min-w-48">Dish Name</th>
                  <th className="p-3.5 w-36">Category</th>
                  <th className="p-3.5 w-28">Price</th>
                  <th className="p-3.5 w-24">Type</th>
                  <th className="p-3.5 w-32">Availability</th>
                  <th className="p-3.5 w-28">Added On</th>
                  <th className="p-3.5 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExistingItems.map((item, idx) => (
                  <tr key={item._id} className="transition hover:bg-muted/20">
                    <td className="p-3.5 text-center font-bold text-muted-foreground">{idx + 1}</td>

                    {/* Image */}
                    <td className="p-3.5">
                      <div className="size-12 overflow-hidden rounded-xl border bg-muted shadow-inner">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="size-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name & Details */}
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{item.name}</span>
                        {item.shortDescription && (
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.shortDescription}
                          </span>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags?.isBestseller && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                              ★ Bestseller
                            </span>
                          )}
                          {item.tags?.isSpicy && (
                            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                              🌶 Spicy
                            </span>
                          )}
                          {item.tags?.isJain && (
                            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-600">
                              Jain
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5 rounded-lg">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">
                          {formatCurrency(item.price)}
                        </span>
                        {item.discountPrice && item.discountPrice < item.price && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatCurrency(item.discountPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Veg / Non-Veg */}
                    <td className="p-3.5">
                      <StatusBadge value={item.isVeg ? "Veg" : "Non-Veg"} />
                    </td>

                    {/* Availability toggle */}
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item._id, item.isAvailable)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition shadow-xs",
                          item.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            item.isAvailable ? "bg-emerald-500" : "bg-muted-foreground"
                          )}
                        />
                        {item.isAvailable ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="p-3.5 text-muted-foreground text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Delete Action */}
                    <td className="p-3.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteExistingItem(item._id, item.name)}
                        title="Delete Menu Item"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
