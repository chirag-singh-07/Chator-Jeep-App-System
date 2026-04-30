import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { apiClient } from "@/lib/api";

type MenuCategory = {
  _id: string;
  name: string;
  image?: string;
  subcategories?: string[];
};

type MenuTagState = {
  isJain: boolean;
  isSpicy: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
};

type PriceOption = {
  id: string;
  name: string;
  price: string;
};

type AddOnInput = {
  id: string;
  name: string;
  price: string;
};

type MenuItemRecord = {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category?: string;
  subcategory?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  showInMenu?: boolean;
  imageUrl?: string;
  addOns?: Array<{ name: string; price: number }>;
  variants?: Array<{ name: string; price: number }>;
  portionSize?: string;
  preparationTimeMins?: number;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  availabilitySlots?: string[];
  tags?: Partial<MenuTagState>;
};

type DishFormState = {
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  category: string;
  subcategory: string;
  isVeg: boolean;
  tags: MenuTagState;
  price: string;
  discountPrice: string;
  portionSize: string;
  isAvailable: boolean;
  availabilitySlots: string[];
  preparationTimeMins: string;
  calories: string;
  ingredients: string;
  allergens: string;
  showInMenu: boolean;
};

const DEFAULT_DISH_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop";

const TIME_SLOTS = ["Breakfast", "Lunch", "Dinner"];
const PORTION_OPTIONS = ["Half", "Full", "Regular", "Large"];

const CATEGORY_EMOJI: Record<string, string> = {
  burgers: "🍔",
  pizza: "🍕",
  wraps: "🌯",
  sandwiches: "🥪",
  biryani: "🍚",
  beverages: "🥤",
  desserts: "🍰",
  chinese: "🥡",
  "south indian": "🥘",
  "north indian": "🍛",
  snacks: "🍟",
  salads: "🥗",
  pasta: "🍝",
  breakfast: "🍳",
  bakery: "🥐",
  "street food": "🌮",
  "thali & combos": "🍱",
  "healthy meals": "🥬",
};

const IMAGE_HINTS = [
  {
    match: /burger|cheese|patty/i,
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop",
  },
  {
    match: /pizza|margherita|slice/i,
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop",
  },
  {
    match: /biryani|rice/i,
    url: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=900&auto=format&fit=crop",
  },
  {
    match: /coffee|shake|juice|drink|tea|mojito/i,
    url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&auto=format&fit=crop",
  },
  {
    match: /cake|dessert|brownie|ice cream/i,
    url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&auto=format&fit=crop",
  },
  {
    match: /salad|healthy|bowl/i,
    url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=900&auto=format&fit=crop",
  },
  {
    match: /pasta|spaghetti/i,
    url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&auto=format&fit=crop",
  },
];

const createEmptyDishForm = (category = "", subcategory = ""): DishFormState => ({
  name: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  category,
  subcategory,
  isVeg: true,
  tags: {
    isJain: false,
    isSpicy: false,
    isBestseller: false,
    isRecommended: false,
  },
  price: "",
  discountPrice: "",
  portionSize: "Regular",
  isAvailable: true,
  availabilitySlots: ["Lunch", "Dinner"],
  preparationTimeMins: "15",
  calories: "",
  ingredients: "",
  allergens: "",
  showInMenu: true,
});

const createVariant = (name = "", price = ""): PriceOption => ({
  id: `${Date.now()}-${Math.random()}`,
  name,
  price,
});

const createAddOn = (name = "", price = ""): AddOnInput => ({
  id: `${Date.now()}-${Math.random()}`,
  name,
  price,
});

const parseCommaSeparated = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatCurrency = (value?: number): string =>
  `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const getCategoryEmoji = (name?: string): string => {
  if (!name) return "🍽️";
  return CATEGORY_EMOJI[name.toLowerCase()] || "🍽️";
};

const getSuggestedImage = (name: string, categoryName?: string): string => {
  const source = `${name} ${categoryName || ""}`.trim();
  const found = IMAGE_HINTS.find((item) => item.match.test(source));
  return found?.url || DEFAULT_DISH_IMAGE;
};

const buildGeneratedDescriptions = (form: DishFormState): {
  shortDescription: string;
  description: string;
} => {
  const dishName = form.name.trim() || "Chef Special";
  const primaryTag = form.tags.isSpicy
    ? "a bold spicy kick"
    : form.isVeg
      ? "fresh vegetarian flavors"
      : "rich, hearty flavors";
  const portion = form.portionSize ? `${form.portionSize.toLowerCase()} serving` : "signature serving";
  const subcategoryText = form.subcategory ? `${form.subcategory.toLowerCase()} style ` : "";

  return {
    shortDescription: `${subCategoryPrefix(form.subcategory)}${dishName} with ${primaryTag}.`,
    description: `${dishName} is our ${subcategoryText}${portion} made for busy meal times. Expect ${primaryTag}, balanced texture, and a plate that works beautifully for repeat orders.`,
  };
};

const subCategoryPrefix = (subcategory?: string): string =>
  subcategory ? `${subcategory} ` : "";

const normalizeMenuPayload = (
  form: DishFormState,
  variants: PriceOption[],
  addOns: AddOnInput[]
) => ({
  name: form.name.trim(),
  shortDescription: form.shortDescription.trim() || undefined,
  description: form.description.trim() || undefined,
  imageUrl: form.imageUrl.trim() || undefined,
  category: form.category || undefined,
  subcategory: form.subcategory || undefined,
  isVeg: form.isVeg,
  price: Number(form.price) || 0,
  discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
  portionSize: form.portionSize || undefined,
  isAvailable: form.isAvailable,
  availabilitySlots: form.availabilitySlots,
  preparationTimeMins: form.preparationTimeMins
    ? Number(form.preparationTimeMins)
    : undefined,
  calories: form.calories ? Number(form.calories) : undefined,
  ingredients: parseCommaSeparated(form.ingredients),
  allergens: parseCommaSeparated(form.allergens),
  showInMenu: form.showInMenu,
  tags: form.tags,
  variants: variants
    .filter((variant) => variant.name.trim() && variant.price.trim())
    .map((variant) => ({
      name: variant.name.trim(),
      price: Number(variant.price) || 0,
    })),
  addOns: addOns
    .filter((addOn) => addOn.name.trim() && addOn.price.trim())
    .map((addOn) => ({
      name: addOn.name.trim(),
      price: Number(addOn.price) || 0,
    })),
});

const parseCsvBoolean = (value?: string): boolean =>
  ["true", "yes", "1", "veg", "on"].includes((value || "").trim().toLowerCase());

export default function MenuScreen() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showDishModal, setShowDishModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [dishForm, setDishForm] = useState<DishFormState>(createEmptyDishForm());
  const [variants, setVariants] = useState<PriceOption[]>([
    createVariant("Regular", ""),
  ]);
  const [addOns, setAddOns] = useState<AddOnInput[]>([]);
  const [bulkCsvText, setBulkCsvText] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === dishForm.category),
    [categories, dishForm.category]
  );

  const availableSubcategories = useMemo(
    () => selectedCategory?.subcategories || [],
    [selectedCategory]
  );

  useEffect(() => {
    void fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setMenuLoading(true);
    try {
      const [categoryResponse, menuResponse] = await Promise.all([
        apiClient.get("/categories"),
        apiClient.get("/restaurants/me/menu"),
      ]);

      const nextCategories = (categoryResponse.data.data || []) as MenuCategory[];
      const nextItems = (menuResponse.data.data || []) as MenuItemRecord[];

      setCategories(nextCategories);
      setItems(nextItems);

      if (nextCategories.length > 0 && !activeCategory) {
        setActiveCategory(nextCategories[0]._id);
      }
    } catch (error) {
      console.warn("Failed fetching menu data:", error);
      setCategories([]);
      setItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const categorySummaries = useMemo(() => {
    return categories.map((category) => {
      const categoryItems = items.filter(
        (item) => item.category === category._id || item.category === category.name
      );
      const minPrice = categoryItems.length
        ? Math.min(...categoryItems.map((item) => item.discountPrice || item.price))
        : 0;

      return {
        ...category,
        count: categoryItems.length,
        minPrice,
        previewImage:
          categoryItems.find((item) => item.imageUrl)?.imageUrl ||
          category.image ||
          DEFAULT_DISH_IMAGE,
      };
    });
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory
        ? item.category === activeCategory || item.category === categories.find((c) => c._id === activeCategory)?.name
        : true;
      const searchValue = query.trim().toLowerCase();
      const matchesQuery = searchValue
        ? `${item.name} ${item.shortDescription || ""} ${item.category || ""} ${item.subcategory || ""}`
            .toLowerCase()
            .includes(searchValue)
        : true;

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, categories, items, query]);

  const resetDishForm = (categoryId?: string) => {
    const defaultCategory = categoryId || activeCategory || categories[0]?._id || "";
    const firstSubcategory =
      categories.find((category) => category._id === defaultCategory)?.subcategories?.[0] || "";

    setEditingItemId(null);
    setDishForm(createEmptyDishForm(defaultCategory, firstSubcategory));
    setVariants([createVariant("Regular", "")]);
    setAddOns([]);
  };

  const openCreateDish = () => {
    resetDishForm();
    setShowDishModal(true);
  };

  const openEditDish = (item: MenuItemRecord) => {
    setEditingItemId(item._id);
    setDishForm({
      name: item.name || "",
      shortDescription: item.shortDescription || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      category: item.category || activeCategory || "",
      subcategory: item.subcategory || "",
      isVeg: Boolean(item.isVeg),
      tags: {
        isJain: Boolean(item.tags?.isJain),
        isSpicy: Boolean(item.tags?.isSpicy),
        isBestseller: Boolean(item.tags?.isBestseller),
        isRecommended: Boolean(item.tags?.isRecommended),
      },
      price: item.price ? String(item.price) : "",
      discountPrice: item.discountPrice ? String(item.discountPrice) : "",
      portionSize: item.portionSize || "Regular",
      isAvailable: item.isAvailable ?? true,
      availabilitySlots: item.availabilitySlots?.length
        ? item.availabilitySlots
        : ["Lunch", "Dinner"],
      preparationTimeMins: item.preparationTimeMins
        ? String(item.preparationTimeMins)
        : "15",
      calories: item.calories ? String(item.calories) : "",
      ingredients: item.ingredients?.join(", ") || "",
      allergens: item.allergens?.join(", ") || "",
      showInMenu: item.showInMenu ?? true,
    });
    setVariants(
      item.variants?.length
        ? item.variants.map((variant) =>
            createVariant(variant.name, String(variant.price))
          )
        : [createVariant("Regular", item.price ? String(item.price) : "")]
    );
    setAddOns(
      item.addOns?.length
        ? item.addOns.map((addOn) => createAddOn(addOn.name, String(addOn.price)))
        : []
    );
    setShowDishModal(true);
  };

  const duplicateDish = (item: MenuItemRecord) => {
    openEditDish(item);
    setEditingItemId(null);
    setDishForm((current) => ({
      ...current,
      name: `${item.name} Copy`,
    }));
  };

  const pickDishImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setDishForm((current) => ({
        ...current,
        imageUrl: result.assets[0]?.uri || current.imageUrl,
      }));
    }
  };

  const suggestDishImage = () => {
    const categoryName = categories.find(
      (category) => category._id === dishForm.category
    )?.name;
    const suggested = getSuggestedImage(dishForm.name, categoryName);
    setDishForm((current) => ({ ...current, imageUrl: suggested }));
  };

  const generateDescriptions = () => {
    const generated = buildGeneratedDescriptions(dishForm);
    setDishForm((current) => ({
      ...current,
      shortDescription: generated.shortDescription,
      description: generated.description,
      imageUrl: current.imageUrl || getSuggestedImage(current.name, selectedCategory?.name),
    }));
  };

  const handleSaveDish = async (options?: { addAnother?: boolean }) => {
    if (!dishForm.name.trim() || !dishForm.price.trim() || !dishForm.category) {
      Alert.alert(
        "Dish details missing",
        "Please enter the dish name, price, and category before saving."
      );
      return;
    }

    const payload = normalizeMenuPayload(dishForm, variants, addOns);
    setSubmitting(true);

    try {
      if (editingItemId) {
        await apiClient.patch(`/restaurants/me/menu/${editingItemId}`, payload);
        Alert.alert("Dish updated", "Your food item has been refreshed in the menu.");
      } else {
        await apiClient.post("/restaurants/me/menu", payload);
        Alert.alert("Dish saved", "The menu item is now ready for your customers.");
      }

      await fetchMenuData();

      if (options?.addAnother) {
        resetDishForm(dishForm.category);
      } else {
        setShowDishModal(false);
      }
    } catch (error: any) {
      Alert.alert(
        "Save failed",
        error?.response?.data?.message || "We could not save this dish right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDish = (item: MenuItemRecord) => {
    Alert.alert(
      "Delete dish",
      `Remove ${item.name} from your menu?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/restaurants/me/menu/${item._id}`);
              await fetchMenuData();
            } catch (error) {
              Alert.alert("Delete failed", "We could not remove this dish.");
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (item: MenuItemRecord) => {
    const nextValue = !(item.isAvailable ?? true);
    setItems((current) =>
      current.map((currentItem) =>
        currentItem._id === item._id
          ? { ...currentItem, isAvailable: nextValue }
          : currentItem
      )
    );

    try {
      await apiClient.patch(`/restaurants/me/menu/${item._id}/stock`, {
        isAvailable: nextValue,
      });
    } catch (error) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem._id === item._id
            ? { ...currentItem, isAvailable: item.isAvailable }
            : currentItem
        )
      );
      Alert.alert("Update failed", "We could not update availability.");
    }
  };

  const toggleTimeSlot = (slot: string) => {
    setDishForm((current) => ({
      ...current,
      availabilitySlots: current.availabilitySlots.includes(slot)
        ? current.availabilitySlots.filter((currentSlot) => currentSlot !== slot)
        : [...current.availabilitySlots, slot],
    }));
  };

  const parseAndUploadCsv = async () => {
    const lines = bulkCsvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      Alert.alert(
        "CSV needed",
        "Paste a CSV with a header row and at least one dish row."
      );
      return;
    }

    const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
    const rows = lines.slice(1);

    setBulkUploading(true);

    try {
      for (const row of rows) {
        const cells = row.split(",").map((cell) => cell.trim());
        const record = headers.reduce<Record<string, string>>((accumulator, header, index) => {
          accumulator[header] = cells[index] || "";
          return accumulator;
        }, {});

        const matchedCategory = categories.find(
          (category) =>
            category.name.toLowerCase() === record.category?.toLowerCase()
        );

        await apiClient.post("/restaurants/me/menu", {
          name: record.name,
          shortDescription: record.shortdescription || record.short_description || undefined,
          description: record.description || undefined,
          imageUrl: record.imageurl || record.image_url || undefined,
          category: matchedCategory?._id || record.category || activeCategory || undefined,
          subcategory: record.subcategory || undefined,
          isVeg: parseCsvBoolean(record.isveg || record.veg),
          price: Number(record.price || 0),
          discountPrice: record.discountprice
            ? Number(record.discountprice)
            : undefined,
          portionSize: record.portionsize || record.portion_size || undefined,
          isAvailable: !["false", "0", "no"].includes(
            (record.isavailable || "").toLowerCase()
          ),
          showInMenu: !["false", "0", "no"].includes(
            (record.showinmenu || "").toLowerCase()
          ),
          preparationTimeMins: record.preparationtimemins
            ? Number(record.preparationtimemins)
            : undefined,
          availabilitySlots: record.availabilityslots
            ? parseCommaSeparated(record.availabilityslots)
            : ["Lunch", "Dinner"],
          tags: {
            isJain: parseCsvBoolean(record.isjain),
            isSpicy: parseCsvBoolean(record.isspicy),
            isBestseller: parseCsvBoolean(record.isbestseller),
            isRecommended: parseCsvBoolean(record.isrecommended),
          },
        });
      }

      Alert.alert("Bulk upload complete", `${rows.length} dishes were added.`);
      setBulkCsvText("");
      setShowBulkModal(false);
      await fetchMenuData();
    } catch (error: any) {
      Alert.alert(
        "Bulk upload failed",
        error?.response?.data?.message || "Please check your CSV formatting."
      );
    } finally {
      setBulkUploading(false);
    }
  };

  const renderTagChip = (
    label: string,
    active: boolean,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap
  ) => (
    <TouchableOpacity
      key={label}
      style={[styles.optionChip, active && styles.optionChipActive]}
      onPress={onPress}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? Colors.light.black : Colors.light.primary}
        />
      ) : null}
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.screenContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Manage Menu</Text>
              <Text style={styles.heroTitle}>Create dishes your customers actually want to order.</Text>
              <Text style={styles.heroSubtitle}>
                Add menu items, set pricing, manage add-ons, and keep availability fresh through the day.
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeValue}>{items.length}</Text>
              <Text style={styles.heroBadgeLabel}>Dishes</Text>
            </View>
          </View>

          <View style={styles.heroActionRow}>
            <TouchableOpacity style={styles.primaryAction} onPress={openCreateDish}>
              <Ionicons name="add-circle" size={18} color={Colors.light.black} />
              <Text style={styles.primaryActionText}>Add Dish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => setShowBulkModal(true)}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.secondaryActionText}>Bulk Upload CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchCard}>
          <Ionicons name="search" size={18} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes, categories, or quick notes"
            placeholderTextColor={Colors.light.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menu Categories</Text>
          <Text style={styles.sectionSubtitle}>Food count, thumbnail, and starting price at a glance.</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categorySummaries.map((category) => {
            const selected = activeCategory === category._id;
            return (
              <TouchableOpacity
                key={category._id}
                style={[styles.categoryCard, selected && styles.categoryCardActive]}
                onPress={() => setActiveCategory(category._id)}
              >
                <Image
                  source={{ uri: category.previewImage }}
                  style={styles.categoryCardImage}
                  contentFit="cover"
                />
                <View style={styles.categoryCardOverlay} />
                <View style={styles.categoryCardContent}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(category.name)}</Text>
                  <Text style={styles.categoryCardTitle}>{category.name}</Text>
                  <Text style={styles.categoryCardMeta}>
                    {category.count} {category.count === 1 ? "dish" : "dishes"} • Starting{" "}
                    {category.count ? formatCurrency(category.minPrice) : "₹0"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menu Items</Text>
          <Text style={styles.sectionSubtitle}>
            Better previews, clearer pricing, and faster edit actions.
          </Text>
        </View>

        {menuLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={{ marginTop: 40 }}
          />
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={44} color={Colors.light.primary} />
            <Text style={styles.emptyTitle}>Your menu is waiting for its first star item.</Text>
            <Text style={styles.emptySubtitle}>
              Add dishes with photos, tags, variants, and timing so the menu feels complete from day one.
            </Text>
            <TouchableOpacity style={styles.primaryAction} onPress={openCreateDish}>
              <Text style={styles.primaryActionText}>Create Menu Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredItems.map((item) => {
            const finalPrice = item.discountPrice || item.price;
            const categoryName =
              categories.find((category) => category._id === item.category)?.name ||
              item.category ||
              "General";
            return (
              <View key={item._id} style={styles.dishCard}>
                <Image
                  source={{ uri: item.imageUrl || DEFAULT_DISH_IMAGE }}
                  style={styles.dishImage}
                  contentFit="cover"
                />
                <View style={styles.dishContent}>
                  <View style={styles.dishTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dishName}>{item.name}</Text>
                      <Text style={styles.dishShortDescription} numberOfLines={2}>
                        {item.shortDescription || item.description || `${categoryName} special`}
                      </Text>
                    </View>
                    {item.tags?.isBestseller ? (
                      <View style={styles.highlightBadge}>
                        <Ionicons name="star" size={12} color={Colors.light.black} />
                        <Text style={styles.highlightBadgeText}>Bestseller</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.dishMetaRow}>
                    <Text style={styles.dishPrice}>{formatCurrency(finalPrice)}</Text>
                    {item.discountPrice ? (
                      <Text style={styles.dishOriginalPrice}>{formatCurrency(item.price)}</Text>
                    ) : null}
                    <Text style={styles.dishMetaDot}>•</Text>
                    <Text style={styles.dishMetaText}>
                      {item.preparationTimeMins || 15} mins
                    </Text>
                  </View>

                  <View style={styles.dishMetaRow}>
                    {renderTagChip(
                      item.isVeg ? "Veg" : "Non-Veg",
                      true,
                      () => undefined,
                      item.isVeg ? "leaf-outline" : "flame-outline"
                    )}
                    {item.tags?.isRecommended
                      ? renderTagChip("Recommended", true, () => undefined, "sparkles-outline")
                      : null}
                    <Text style={styles.dishAuxText}>
                      {item.subcategory || categoryName}
                    </Text>
                  </View>

                  <View style={styles.dishFooter}>
                    <View style={styles.availabilityBlock}>
                      <Text
                        style={[
                          styles.availabilityLabel,
                          {
                            color: item.isAvailable
                              ? Colors.light.success
                              : Colors.light.textMuted,
                          },
                        ]}
                      >
                        {item.isAvailable ? "Available today" : "Hidden for now"}
                      </Text>
                      <Switch
                        value={Boolean(item.isAvailable)}
                        onValueChange={() => void toggleAvailability(item)}
                        trackColor={{
                          false: "#2A2A2A",
                          true: `${Colors.light.primary}55`,
                        }}
                        thumbColor={
                          item.isAvailable ? Colors.light.primary : "#6B7280"
                        }
                      />
                    </View>

                    <View style={styles.cardActionRow}>
                      <TouchableOpacity
                        style={styles.cardIconButton}
                        onPress={() => duplicateDish(item)}
                      >
                        <Ionicons name="copy-outline" size={16} color="#E5E7EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardIconButton}
                        onPress={() => openEditDish(item)}
                      >
                        <Ionicons name="create-outline" size={16} color="#E5E7EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cardIconButton, styles.cardIconDanger]}
                        onPress={() => handleDeleteDish(item)}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.light.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showDishModal} animationType="slide">
        <SafeAreaView style={styles.modalPage} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>
                {editingItemId ? "Edit Food Item" : "Create Menu Item"}
              </Text>
              <Text style={styles.modalTitle}>
                {editingItemId ? "Update your dish details" : "Add a new dish to the menu"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDishModal(false)}
            >
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Basic Info</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Dish name *"
                placeholderTextColor={Colors.light.textMuted}
                value={dishForm.name}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, name: value }))
                }
              />
              <TextInput
                style={styles.formInput}
                placeholder="Short description"
                placeholderTextColor={Colors.light.textMuted}
                value={dishForm.shortDescription}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, shortDescription: value }))
                }
              />
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Full description"
                placeholderTextColor={Colors.light.textMuted}
                multiline
                value={dishForm.description}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, description: value }))
                }
              />
              <View style={styles.inlineActionRow}>
                <TouchableOpacity
                  style={styles.smallAction}
                  onPress={generateDescriptions}
                >
                  <Ionicons name="sparkles-outline" size={16} color={Colors.light.primary} />
                  <Text style={styles.smallActionText}>Generate food description</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Images</Text>
              <View style={styles.dualActionRow}>
                <TouchableOpacity style={styles.outlineAction} onPress={() => void pickDishImage()}>
                  <Ionicons name="image-outline" size={18} color={Colors.light.primary} />
                  <Text style={styles.outlineActionText}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineAction} onPress={suggestDishImage}>
                  <Ionicons name="flash-outline" size={18} color={Colors.light.primary} />
                  <Text style={styles.outlineActionText}>Suggest Image</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Paste image URL"
                placeholderTextColor={Colors.light.textMuted}
                value={dishForm.imageUrl}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, imageUrl: value }))
                }
              />
              <Image
                source={{ uri: dishForm.imageUrl || DEFAULT_DISH_IMAGE }}
                style={styles.imagePreview}
                contentFit="cover"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Category & Tags</Text>
              <Text style={styles.inputLabel}>Choose category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionRow}>
                  {categories.map((category) =>
                    renderTagChip(
                      `${getCategoryEmoji(category.name)} ${category.name}`,
                      dishForm.category === category._id,
                      () =>
                        setDishForm((current) => ({
                          ...current,
                          category: category._id,
                          subcategory: category.subcategories?.[0] || "",
                        }))
                    )
                  )}
                </View>
              </ScrollView>

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Choose subcategory</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionRow}>
                  {availableSubcategories.length ? (
                    availableSubcategories.map((subcategory) =>
                      renderTagChip(
                        subcategory,
                        dishForm.subcategory === subcategory,
                        () =>
                          setDishForm((current) => ({
                            ...current,
                            subcategory,
                          }))
                      )
                    )
                  ) : (
                    <Text style={styles.helperText}>
                      No subcategories yet for this category.
                    </Text>
                  )}
                </View>
              </ScrollView>

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Dish tags</Text>
              <View style={styles.wrapRow}>
                {renderTagChip("Veg", dishForm.isVeg, () =>
                  setDishForm((current) => ({ ...current, isVeg: true }))
                )}
                {renderTagChip("Non-Veg", !dishForm.isVeg, () =>
                  setDishForm((current) => ({ ...current, isVeg: false }))
                )}
                {renderTagChip("Jain", dishForm.tags.isJain, () =>
                  setDishForm((current) => ({
                    ...current,
                    tags: { ...current.tags, isJain: !current.tags.isJain },
                  }))
                )}
                {renderTagChip("Spicy", dishForm.tags.isSpicy, () =>
                  setDishForm((current) => ({
                    ...current,
                    tags: { ...current.tags, isSpicy: !current.tags.isSpicy },
                  }))
                )}
                {renderTagChip("Bestseller", dishForm.tags.isBestseller, () =>
                  setDishForm((current) => ({
                    ...current,
                    tags: {
                      ...current.tags,
                      isBestseller: !current.tags.isBestseller,
                    },
                  }))
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Pricing</Text>
              <View style={styles.twoColumnRow}>
                <TextInput
                  style={[styles.formInput, styles.flexInput]}
                  placeholder="Price *"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="numeric"
                  value={dishForm.price}
                  onChangeText={(value) =>
                    setDishForm((current) => ({ ...current, price: value }))
                  }
                />
                <TextInput
                  style={[styles.formInput, styles.flexInput]}
                  placeholder="Discount price"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="numeric"
                  value={dishForm.discountPrice}
                  onChangeText={(value) =>
                    setDishForm((current) => ({
                      ...current,
                      discountPrice: value,
                    }))
                  }
                />
              </View>
              <Text style={styles.inputLabel}>Portion size</Text>
              <View style={styles.wrapRow}>
                {PORTION_OPTIONS.map((portion) =>
                  renderTagChip(
                    portion,
                    dishForm.portionSize === portion,
                    () =>
                      setDishForm((current) => ({
                        ...current,
                        portionSize: portion,
                      }))
                  )
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Customization</Text>
              <View style={styles.subSectionHeader}>
                <Text style={styles.inputLabel}>Variants</Text>
                <TouchableOpacity
                  style={styles.addMiniButton}
                  onPress={() =>
                    setVariants((current) => [...current, createVariant()])
                  }
                >
                  <Ionicons name="add" size={16} color={Colors.light.primary} />
                  <Text style={styles.addMiniButtonText}>Add variant</Text>
                </TouchableOpacity>
              </View>
              {variants.map((variant, index) => (
                <View key={variant.id} style={styles.dynamicRow}>
                  <TextInput
                    style={[styles.formInput, styles.flexInput]}
                    placeholder="Small / Medium / Large"
                    placeholderTextColor={Colors.light.textMuted}
                    value={variant.name}
                    onChangeText={(value) =>
                      setVariants((current) =>
                        current.map((currentVariant, currentIndex) =>
                          currentIndex === index
                            ? { ...currentVariant, name: value }
                            : currentVariant
                        )
                      )
                    }
                  />
                  <TextInput
                    style={[styles.formInput, styles.priceInput]}
                    placeholder="₹"
                    placeholderTextColor={Colors.light.textMuted}
                    keyboardType="numeric"
                    value={variant.price}
                    onChangeText={(value) =>
                      setVariants((current) =>
                        current.map((currentVariant, currentIndex) =>
                          currentIndex === index
                            ? { ...currentVariant, price: value }
                            : currentVariant
                        )
                      )
                    }
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      setVariants((current) =>
                        current.length === 1
                          ? current
                          : current.filter((currentVariant) => currentVariant.id !== variant.id)
                      )
                    }
                  >
                    <Ionicons name="close" size={18} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={[styles.subSectionHeader, { marginTop: 18 }]}>
                <Text style={styles.inputLabel}>Add-ons</Text>
                <TouchableOpacity
                  style={styles.addMiniButton}
                  onPress={() => setAddOns((current) => [...current, createAddOn()])}
                >
                  <Ionicons name="add" size={16} color={Colors.light.primary} />
                  <Text style={styles.addMiniButtonText}>Add add-on</Text>
                </TouchableOpacity>
              </View>
              {addOns.length ? (
                addOns.map((addOn, index) => (
                  <View key={addOn.id} style={styles.dynamicRow}>
                    <TextInput
                      style={[styles.formInput, styles.flexInput]}
                      placeholder="Extra Cheese"
                      placeholderTextColor={Colors.light.textMuted}
                      value={addOn.name}
                      onChangeText={(value) =>
                        setAddOns((current) =>
                          current.map((currentAddOn, currentIndex) =>
                            currentIndex === index
                              ? { ...currentAddOn, name: value }
                              : currentAddOn
                          )
                        )
                      }
                    />
                    <TextInput
                      style={[styles.formInput, styles.priceInput]}
                      placeholder="₹"
                      placeholderTextColor={Colors.light.textMuted}
                      keyboardType="numeric"
                      value={addOn.price}
                      onChangeText={(value) =>
                        setAddOns((current) =>
                          current.map((currentAddOn, currentIndex) =>
                            currentIndex === index
                              ? { ...currentAddOn, price: value }
                              : currentAddOn
                          )
                        )
                      }
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setAddOns((current) =>
                          current.filter((currentAddOn) => currentAddOn.id !== addOn.id)
                        )
                      }
                    >
                      <Ionicons name="close" size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.helperText}>
                  Add extras like cheese, dips, toppings, or premium sides.
                </Text>
              )}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Availability</Text>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Available today</Text>
                  <Text style={styles.switchSubtitle}>
                    Let customers order this dish right now.
                  </Text>
                </View>
                <Switch
                  value={dishForm.isAvailable}
                  onValueChange={(value) =>
                    setDishForm((current) => ({ ...current, isAvailable: value }))
                  }
                  trackColor={{
                    false: "#2A2A2A",
                    true: `${Colors.light.primary}55`,
                  }}
                  thumbColor={
                    dishForm.isAvailable ? Colors.light.primary : "#6B7280"
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Time slots</Text>
              <View style={styles.wrapRow}>
                {TIME_SLOTS.map((slot) =>
                  renderTagChip(
                    slot,
                    dishForm.availabilitySlots.includes(slot),
                    () => toggleTimeSlot(slot)
                  )
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Advanced</Text>
              <View style={styles.twoColumnRow}>
                <TextInput
                  style={[styles.formInput, styles.flexInput]}
                  placeholder="Preparation time (mins)"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="numeric"
                  value={dishForm.preparationTimeMins}
                  onChangeText={(value) =>
                    setDishForm((current) => ({
                      ...current,
                      preparationTimeMins: value,
                    }))
                  }
                />
                <TextInput
                  style={[styles.formInput, styles.flexInput]}
                  placeholder="Calories"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="numeric"
                  value={dishForm.calories}
                  onChangeText={(value) =>
                    setDishForm((current) => ({ ...current, calories: value }))
                  }
                />
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Ingredients (comma separated)"
                placeholderTextColor={Colors.light.textMuted}
                value={dishForm.ingredients}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, ingredients: value }))
                }
              />
              <TextInput
                style={styles.formInput}
                placeholder="Allergens (comma separated)"
                placeholderTextColor={Colors.light.textMuted}
                value={dishForm.allergens}
                onChangeText={(value) =>
                  setDishForm((current) => ({ ...current, allergens: value }))
                }
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Visibility</Text>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Show in menu</Text>
                  <Text style={styles.switchSubtitle}>
                    Keep this dish visible in the customer-facing menu.
                  </Text>
                </View>
                <Switch
                  value={dishForm.showInMenu}
                  onValueChange={(value) =>
                    setDishForm((current) => ({ ...current, showInMenu: value }))
                  }
                  trackColor={{
                    false: "#2A2A2A",
                    true: `${Colors.light.primary}55`,
                  }}
                  thumbColor={
                    dishForm.showInMenu ? Colors.light.primary : "#6B7280"
                  }
                />
              </View>
              <View style={styles.wrapRow}>
                {renderTagChip("Bestseller", dishForm.tags.isBestseller, () =>
                  setDishForm((current) => ({
                    ...current,
                    tags: {
                      ...current.tags,
                      isBestseller: !current.tags.isBestseller,
                    },
                  }))
                )}
                {renderTagChip("Recommended", dishForm.tags.isRecommended, () =>
                  setDishForm((current) => ({
                    ...current,
                    tags: {
                      ...current.tags,
                      isRecommended: !current.tags.isRecommended,
                    },
                  }))
                )}
              </View>
            </View>

            <View style={styles.ctaGroup}>
              <TouchableOpacity
                style={[styles.primaryAction, submitting && styles.disabledAction]}
                disabled={submitting}
                onPress={() => void handleSaveDish()}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.light.black} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color={Colors.light.black} />
                    <Text style={styles.primaryActionText}>Save Dish</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryAction, submitting && styles.disabledAction]}
                disabled={submitting}
                onPress={() => void handleSaveDish({ addAnother: true })}
              >
                <Ionicons name="add-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.secondaryActionText}>Save & Add Another</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showBulkModal} animationType="slide" transparent>
        <View style={styles.bulkOverlay}>
          <SafeAreaView style={styles.bulkModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>Bulk Upload</Text>
                <Text style={styles.modalTitle}>Paste CSV rows to upload multiple dishes.</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowBulkModal(false)}
              >
                <Ionicons name="close" size={22} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.helperText}>
                CSV columns: `name,price,category,subcategory,isVeg,imageUrl,shortDescription`
              </Text>
              <TextInput
                style={[styles.formInput, styles.bulkInput]}
                placeholder="name,price,category,subcategory,isVeg,imageUrl,shortDescription"
                placeholderTextColor={Colors.light.textMuted}
                multiline
                value={bulkCsvText}
                onChangeText={setBulkCsvText}
              />
              <TouchableOpacity
                style={[styles.primaryAction, bulkUploading && styles.disabledAction]}
                disabled={bulkUploading}
                onPress={() => void parseAndUploadCsv()}
              >
                {bulkUploading ? (
                  <ActivityIndicator color={Colors.light.black} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color={Colors.light.black} />
                    <Text style={styles.primaryActionText}>Upload CSV Dishes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  screenContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#0F0F10",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1F1F22",
    gap: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  eyebrow: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.light.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    color: "#9B9CA3",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  heroBadge: {
    width: 88,
    minHeight: 88,
    borderRadius: 24,
    backgroundColor: "#171719",
    borderWidth: 1,
    borderColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  heroBadgeValue: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "900",
  },
  heroBadgeLabel: {
    color: Colors.light.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionText: {
    color: Colors.light.black,
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2B2B31",
    backgroundColor: "#121214",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryActionText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  disabledAction: {
    opacity: 0.55,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0F0F10",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1A1A1D",
    paddingHorizontal: 16,
    minHeight: 54,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 15,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: "#8D8E96",
    fontSize: 13,
    lineHeight: 19,
  },
  categoryScrollContent: {
    gap: 14,
    paddingRight: 12,
  },
  categoryCard: {
    width: 220,
    height: 142,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1F1F24",
  },
  categoryCardActive: {
    borderColor: Colors.light.primary,
  },
  categoryCardImage: {
    width: "100%",
    height: "100%",
  },
  categoryCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  categoryCardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryCardTitle: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "900",
  },
  categoryCardMeta: {
    color: "#F6E7A4",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#101011",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#1D1D20",
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
    gap: 14,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#8D8E96",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  dishCard: {
    backgroundColor: "#0E0E10",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1B1B1E",
    marginBottom: 14,
  },
  dishImage: {
    width: "100%",
    height: 182,
    backgroundColor: "#171717",
  },
  dishContent: {
    padding: 18,
    gap: 14,
  },
  dishTopRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  dishName: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "900",
  },
  dishShortDescription: {
    color: "#9B9CA3",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  highlightBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  highlightBadgeText: {
    color: Colors.light.black,
    fontSize: 11,
    fontWeight: "900",
  },
  dishMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  dishPrice: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  dishOriginalPrice: {
    color: "#7A7B82",
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  dishMetaDot: {
    color: "#5C5D64",
    fontSize: 14,
  },
  dishMetaText: {
    color: "#C7C8CE",
    fontSize: 13,
    fontWeight: "700",
  },
  dishAuxText: {
    color: "#92939A",
    fontSize: 12,
    fontWeight: "700",
  },
  dishFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  availabilityBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },
  cardActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  cardIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#2A2A2D",
  },
  cardIconDanger: {
    borderColor: "#3A1717",
  },
  modalPage: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#141416",
  },
  modalTitle: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    lineHeight: 30,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#141416",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  formSection: {
    backgroundColor: "#0F0F10",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1A1A1D",
    padding: 18,
    gap: 14,
  },
  formSectionTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "900",
  },
  formInput: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#252529",
    backgroundColor: "#141417",
    color: Colors.light.text,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  inlineActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  smallAction: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B2B31",
    backgroundColor: "#131316",
    paddingHorizontal: 12,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallActionText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  dualActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  outlineAction: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2B2B31",
    backgroundColor: "#131316",
    paddingHorizontal: 16,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  outlineActionText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
  },
  inputLabel: {
    color: "#A5A6AE",
    fontSize: 12,
    fontWeight: "800",
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: "#17171A",
    borderWidth: 1,
    borderColor: "#27272D",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  optionChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionChipText: {
    color: "#F3E5A0",
    fontSize: 12,
    fontWeight: "800",
  },
  optionChipTextActive: {
    color: Colors.light.black,
  },
  helperText: {
    color: "#8D8E96",
    fontSize: 12,
    lineHeight: 18,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },
  flexInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  switchTitle: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "800",
  },
  switchSubtitle: {
    color: "#8D8E96",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  subSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  addMiniButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addMiniButtonText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  dynamicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    width: 88,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181B",
  },
  ctaGroup: {
    gap: 10,
  },
  bulkOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  bulkModal: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#1B1B1E",
  },
  bulkInput: {
    minHeight: 220,
    paddingTop: 14,
    textAlignVertical: "top",
  },
});
