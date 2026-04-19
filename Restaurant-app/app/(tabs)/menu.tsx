import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/api";

// Note: For full local image picking, expo-image-picker is required. We are mocking the UI for now.

export default function MenuScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      // Assuming a GET endpoint exists or using mock data if building out the UI first
      const [catRes, itemRes] = await Promise.all([
        apiClient.get("/categories"),
        apiClient.get(`/restaurants/menu`),
      ]);
      setCategories(catRes.data.data || []);
      setItems(itemRes.data.data || []);

      if (catRes.data.data?.length > 0) {
        setActiveCategory(catRes.data.data[0]._id);
      }
    } catch (_) {
      console.warn("Failed fetching live menu. Loading mock data for UI testing.");
      setCategories([
        { _id: "c1", name: "Burgers" },
        { _id: "c2", name: "Beverages" },
        { _id: "c3", name: "Snacks" },
      ]);
      setItems([
        {
          _id: "i1",
          category: "c1",
          name: "Spicy Chicken Burger",
          price: 299,
          inStock: true,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
        },
        {
          _id: "i2",
          category: "c1",
          name: "Veggie Delight",
          price: 199,
          inStock: false,
          image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200",
        },
        {
          _id: "i3",
          category: "c2",
          name: "Classic Cola",
          price: 60,
          inStock: true,
          image:
            "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200",
        },
      ]);
      setActiveCategory("c1");
    }
  };

  const filteredItems = items.filter(
    (item) => item.category === activeCategory,
  );

  const toggleStock = async (itemId: string, currentVal: boolean) => {
    // Optimistic UI
    setItems(
      items.map((i) => (i._id === itemId ? { ...i, inStock: !currentVal } : i)),
    );
    try {
      // await apiClient.patch(`/restaurants/menu/${itemId}/stock`, { inStock: !currentVal });
    } catch (e) {
      setItems(
        items.map((i) =>
          i._id === itemId ? { ...i, inStock: currentVal } : i,
        ),
      ); // Revert
    }
  };

  const renderItemCard = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemActions}>
        <Text
          style={[
            styles.stockText,
            { color: item.inStock ? Colors.light.success : "red" },
          ]}
        >
          {item.inStock ? "IN STOCK" : "OUT"}
        </Text>
        <Switch
          value={item.inStock}
          onValueChange={(val) => toggleStock(item._id, !val)}
          trackColor={{ false: "#ffebee", true: "#e8f5e9" }}
          thumbColor={item.inStock ? Colors.light.success : "#f44336"}
        />
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Editor</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addBtnText}>New Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                activeCategory === cat._id && styles.activeCategoryPill,
              ]}
              onPress={() => setActiveCategory(cat._id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat._id && styles.activeCategoryText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItemCard}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.text,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  categoriesContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
  },
  activeCategoryPill: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontWeight: "bold",
    color: "#666",
  },
  activeCategoryText: {
    color: "white",
  },
  listContent: {
    padding: 20,
    gap: 15,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#EFEFEF",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "900",
    marginTop: 4,
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 5,
    paddingRight: 5,
  },
  stockText: {
    fontSize: 10,
    fontWeight: "900",
  },
  editBtn: {
    padding: 8,
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 10,
  },
});
