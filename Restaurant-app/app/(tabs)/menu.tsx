import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface AddOn {
  name: string;
  price: string;
}

export default function MenuScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const { user } = useAuthStore();

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
  });
  const [addOns, setAddOns] = useState<AddOn[]>([]);

  useEffect(() => {
    fetchMenuData();
  }, [user?.restaurantId]);

  const fetchMenuData = async () => {
    setMenuLoading(true);
    try {
      const restaurantId = user?.restaurantId;
      if (!restaurantId) {
        setMenuLoading(false);
        return;
      }

      const [catRes, itemRes] = await Promise.all([
        apiClient.get("/categories"),
        apiClient.get(`/restaurants/${restaurantId}/menu`),
      ]);
      setCategories(catRes.data.data || []);
      setItems(itemRes.data.data || []);

      if (catRes.data.data?.length > 0) {
        if (!activeCategory) setActiveCategory(catRes.data.data[0]._id);
      }
    } catch (err) {
      console.warn("Failed fetching live menu:", err);
      setCategories([]);
      setItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      Alert.alert("Dossier Incomplete", "Please specify name, price and category protocols.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...newItem,
        price: parseFloat(newItem.price),
        addOns: addOns.map(a => ({ name: a.name, price: parseFloat(a.price || "0") })),
      };

      if (editingItemId) {
        await apiClient.patch(`/restaurants/me/menu/${editingItemId}`, payload);
        Alert.alert("PROTOCOL UPDATED", "Menu item synchronized!");
      } else {
        await apiClient.post("/restaurants/me/menu", payload);
        Alert.alert("PROTOCOL ESTABLISHED", "New item published to node!");
      }

      setShowAddModal(false);
      resetForm();
      fetchMenuData();
    } catch (e: any) {
      Alert.alert("TRANSMISSION ERROR", e.response?.data?.message || "Sync failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    Alert.alert(
      "PURGE ITEM",
      `Are you sure you want to delete ${name} from the node?`,
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "CONFIRM PURGE", 
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/restaurants/me/menu/${id}`);
              fetchMenuData();
            } catch (e) {
              Alert.alert("ERROR", "Purge sequence failed");
            }
          }
        }
      ]
    );
  };

  const handleEditPress = (item: any) => {
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category || item.categoryId || "",
      isVeg: item.isVeg,
      imageUrl: item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
    });
    setAddOns(item.addOns?.map((a: any) => ({ name: a.name, price: (a.price || 0).toString() })) || []);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingItemId(null);
    setNewItem({
      name: "",
      description: "",
      price: "",
      category: activeCategory || "",
      isVeg: true,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
    });
    setAddOns([]);
  };

  const addAddOnRow = () => {
    setAddOns([...addOns, { name: "", price: "" }]);
  };

  const updateAddOn = (index: number, key: keyof AddOn, val: string) => {
    const updated = [...addOns];
    updated[index][key] = val;
    setAddOns(updated);
  };

  const removeAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory || item.categoryId === activeCategory)
    : items;

  const toggleStock = async (itemId: string, currentVal: boolean) => {
    setItems(
      items.map((i) => (i._id === itemId ? { ...i, isAvailable: !currentVal } : i)),
    );
    try {
      await apiClient.patch(`/restaurants/me/menu/${itemId}/stock`, { isAvailable: !currentVal });
    } catch (e) {
      setItems(items.map((i) => i._id === itemId ? { ...i, isAvailable: currentVal } : i));
    }
  };

  const renderItemCard = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <View style={styles.cardMain}>
        <Image
          source={{ uri: item.imageUrl || item.image || "https://via.placeholder.com/150" }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <View style={styles.nameRow}>
            <View style={[styles.vegBadge, { backgroundColor: item.isVeg ? "#4CAF50" : "#F44336" }]} />
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
          <Text style={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
          <View style={styles.metaRow}>
             <Ionicons name="layers-outline" size={12} color="#666" />
             <Text style={styles.addOnCount}>{item.addOns?.length || 0} MODIFIERS</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemFooter}>
         <View style={styles.stockControl}>
            <Text style={[styles.stockStatus, { color: item.isAvailable ? Colors.light.primary : "#444" }]}>
               {item.isAvailable ? "PROTOCOL: ACTIVE" : "PROTOCOL: OFFLINE"}
            </Text>
            <Switch
               value={item.isAvailable}
               onValueChange={(val) => toggleStock(item._id, !val)}
               trackColor={{ false: "#111", true: "#222" }}
               thumbColor={item.isAvailable ? Colors.light.primary : "#333"}
               style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
         </View>
         <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleEditPress(item)}>
               <Ionicons name="construct" size={16} color="#AAA" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.miniActionBtn, styles.dangerBtn]} onPress={() => handleDeleteItem(item._id, item.name)}>
               <Ionicons name="trash" size={16} color="#FF4B3A" />
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Menu Node</Text>
          <Text style={styles.subtitle}>Inventory Protocols</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowAddModal(true); }}>
          <Ionicons name="add" size={20} color="black" />
          <Text style={styles.addBtnText}>NEW ITEM</Text>
        </TouchableOpacity>
      </View>

      {menuLoading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
             <Ionicons name="fast-food" size={64} color="#111" />
          </View>
          <Text style={styles.emptyTitle}>NO DATA FOUND</Text>
          <Text style={styles.emptySub}>Initialize your menu node to start fleet operations.</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { marginTop: 30, paddingHorizontal: 35, height: 60 }]} 
            onPress={() => { resetForm(); setShowAddModal(true); }}
          >
             <Text style={styles.addBtnText}>ADD FIRST ITEM</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(c) => c._id}
              contentContainerStyle={{ paddingHorizontal: 25 }}
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
                    {cat.name.toUpperCase()}
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
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* ADD/EDIT ITEM MODAL */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
               <View>
                  <Text style={styles.modalTitle}>{editingItemId ? "EDITING" : "NEW ITEM"}</Text>
                  <Text style={styles.modalSub}>ASSET CONFIGURATION</Text>
               </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputWrapper}>
                 <Text style={styles.inputLabel}>IDENTIFIER NAME</Text>
                 <TextInput
                  style={styles.input}
                  placeholder="e.g. CORE BURGER"
                  placeholderTextColor="#333"
                  value={newItem.name}
                  onChangeText={(t) => setNewItem({ ...newItem, name: t })}
                />
              </View>

              <View style={styles.inputWrapper}>
                 <Text style={styles.inputLabel}>COMPOSITION DESCRIPTION</Text>
                 <TextInput
                  style={[styles.input, { height: 100, paddingTop: 15, textAlignVertical: "top" }]}
                  placeholder="Specs and details of item..."
                  placeholderTextColor="#333"
                  multiline
                  value={newItem.description}
                  onChangeText={(t) => setNewItem({ ...newItem, description: t })}
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.inputLabel}>VALUE (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="299"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={newItem.price}
                    onChangeText={(t) => setNewItem({ ...newItem, price: t })}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.inputLabel}>NODE CATEGORY</Text>
                  <View style={styles.categoryScroller}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                       {categories.map((c) => (
                        <TouchableOpacity
                          key={c._id}
                          style={[
                            styles.miniPill,
                            newItem.category === c._id && styles.miniPillActive,
                          ]}
                          onPress={() => setNewItem({ ...newItem, category: c._id })}
                        >
                          <Text style={[styles.miniPillText, newItem.category === c._id && styles.miniPillTextActive]}>
                            {c.name.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={styles.switchBox}>
                <View>
                  <Text style={styles.switchLabel}>GREEN PROTOCOL (VEG)</Text>
                  <Text style={styles.switchSub}>Is this item plant-based?</Text>
                </View>
                <Switch
                  value={newItem.isVeg}
                  onValueChange={(v) => setNewItem({ ...newItem, isVeg: v })}
                  trackColor={{ false: "#111", true: "#222" }}
                  thumbColor={newItem.isVeg ? "#4CAF50" : "#F44336"}
                />
              </View>

              {/* ADD ONS SECTION */}
              <View style={styles.addOnHeader}>
                <View>
                   <Text style={styles.sectionTitle}>ASSET MODIFIERS</Text>
                   <Text style={styles.sectionSub}>CUSTOMIZATIONS & ADD-ONS</Text>
                </View>
                <TouchableOpacity style={styles.addAddOnBtn} onPress={addAddOnRow}>
                  <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              {addOns.map((addon, index) => (
                <View key={index} style={styles.addOnRow}>
                  <TextInput
                    style={[styles.input, { flex: 2, marginBottom: 0 }]}
                    placeholder="Extra Cheese"
                    placeholderTextColor="#333"
                    value={addon.name}
                    onChangeText={(t) => updateAddOn(index, "name", t)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 15, marginBottom: 0 }]}
                    placeholder="₹ 50"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={addon.price}
                    onChangeText={(t) => updateAddOn(index, "price", t)}
                  />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeAddOn(index)}>
                    <Ionicons name="trash" size={20} color="#FF4B3A" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
                disabled={submitting}
                onPress={handleSaveItem}
              >
                {submitting ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <>
                     <Text style={styles.submitBtnText}>{editingItemId ? "UPDATE PROTOCOL" : "PUBLISH TO NODE"}</Text>
                     <Ionicons name="sync" size={18} color="black" />
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
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 15,
    gap: 8,
  },
  addBtnText: {
    color: "black",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "#0A0A0A",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  activeCategoryPill: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontWeight: "900",
    color: "#444",
    fontSize: 10,
    letterSpacing: 1,
  },
  activeCategoryText: {
    color: "black",
  },
  listContent: {
    padding: 25,
    paddingTop: 0,
    gap: 20,
  },
  itemCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "#111",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#111",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 18,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vegBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "900",
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  addOnCount: {
    fontSize: 9,
    color: "#555",
    fontWeight: "900",
    letterSpacing: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#151515',
  },
  stockControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stockStatus: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionGroup: {
    flexDirection: "row",
    gap: 12,
  },
  miniActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  dangerBtn: {
    borderColor: "#300",
  },
  emptyContainer: {
     flex: 1, 
     alignItems: 'center', 
     justifyContent: 'center', 
     paddingHorizontal: 40,
     paddingBottom: 100,
  },
  emptyIconBox: {
     width: 120,
     height: 120,
     borderRadius: 40,
     backgroundColor: '#0A0A0A',
     alignItems: 'center',
     justifyContent: 'center',
     borderWidth: 1,
     borderColor: '#111',
     marginBottom: 30,
  },
  emptyTitle: {
     fontSize: 22,
     fontWeight: '900',
     color: '#FFF',
     letterSpacing: 2,
  },
  emptySub: {
     fontSize: 12,
     color: '#444',
     textAlign: 'center',
     marginTop: 10,
     fontWeight: '600',
     lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: "90%",
    borderWidth: 1,
    borderColor: '#222',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  modalSub: {
     fontSize: 10,
     color: Colors.light.primary,
     fontWeight: "800",
     letterSpacing: 2,
     marginTop: 4,
  },
  closeBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  formContent: {
    padding: 30,
  },
  inputWrapper: {
     marginBottom: 25,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#444",
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#0A0A0A",
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  row: {
    flexDirection: "row",
    marginBottom: 25,
  },
  categoryScroller: {
    height: 60,
    justifyContent: "center",
  },
  miniPill: {
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#222",
  },
  miniPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  miniPillText: {
    fontSize: 9,
    color: "#444",
    fontWeight: "900",
    letterSpacing: 1,
  },
  miniPillTextActive: {
    color: "black",
  },
  switchBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 20,
    borderRadius: 25,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#111',
  },
  switchLabel: {
     fontSize: 10,
     fontWeight: '900',
     color: '#FFF',
     letterSpacing: 1,
  },
  switchSub: {
    fontSize: 10,
    color: "#444",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  sectionSub: {
     fontSize: 9,
     color: '#444',
     fontWeight: "800",
     letterSpacing: 1.5,
     marginTop: 4,
  },
  addOnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  addAddOnBtn: {
     width: 45,
     height: 45,
     borderRadius: 15,
     backgroundColor: '#111',
     alignItems: 'center',
     justifyContent: 'center',
  },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  removeBtn: {
    padding: 15,
  },
  modalFooter: {
    padding: 30,
    paddingBottom: 40,
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    height: 70,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    gap: 12,
  },
  submitBtnText: {
    color: "black",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});

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
    justifyContent: "space-between",
    gap: 8,
    paddingRight: 5,
    height: "100%",
    paddingVertical: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: "#F7F8FA",
    borderRadius: 8,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vegBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addOnCount: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  formContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
  },
  pickerContainer: {
    height: 50,
    justifyContent: "center",
  },
  miniPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  miniPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  miniPillText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  miniPillTextActive: {
    color: "white",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  subHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addOnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  addAddOnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addAddOnText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeBtn: {
    padding: 10,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#F0F0F0",
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
