import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Image, Dimensions, SafeAreaView, StatusBar, ActivityIndicator,
  Modal, TextInput, Alert, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useOrderStore } from "@/store/useOrderStore";
import { useSocket } from "@/context/SocketContext";
import Animated, { FadeIn, SlideInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import api from "@/lib/api";
import * as Haptics from "expo-haptics";

const { height } = Dimensions.get("window");

const STEPS = [
  { status: "PENDING",   label: "Order Placed",       icon: "receipt-outline",       desc: "Waiting for restaurant" },
  { status: "ACCEPTED",  label: "Confirmed",           icon: "checkmark-circle",      desc: "Restaurant accepted" },
  { status: "PREPARING", label: "Preparing",           icon: "restaurant-outline",    desc: "Chef is cooking" },
  { status: "READY",     label: "Ready for Pickup",    icon: "bag-check-outline",     desc: "Waiting for rider" },
  { status: "PICKED_UP", label: "Out for Delivery",    icon: "bicycle-outline",       desc: "Rider is on the way" },
  { status: "ARRIVED",   label: "Partner Arrived",     icon: "navigate-circle",       desc: "Partner is at your door" },
  { status: "COMPLETED", label: "Delivered 🎉",         icon: "checkmark-done-circle", desc: "Enjoy your meal!" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B", ACCEPTED: "#3B82F6", PREPARING: "#8B5CF6",
  READY: "#06B6D4", PICKED_UP: "#F97316", ARRIVED: "#10B981", COMPLETED: "#22C55E",
  CANCELLED: "#EF4444",
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentOrder: order, isLoading, fetchOrderDetail, cancelOrder, updateCurrentOrderFromSocket } = useOrderStore();
  const { socket } = useSocket();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const pulseAnim = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseAnim.value }] }));

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) fetchOrderDetail(id);

    // Polling fallback every 15s
    const interval = setInterval(() => { if (id) fetchOrderDetail(id); }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  // ── Socket: listen for order status updates ──────────────────────────────────
  useEffect(() => {
    if (!socket || !id) return;

    const handleNotification = (data: any) => {
      if (data?.data?.orderId === id || data?.orderId === id) {
        updateCurrentOrderFromSocket({ ...data, status: data?.data?.status || order?.status });
        fetchOrderDetail(id); // Re-fetch for full data
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };

    const handleOrderUpdate = (data: any) => {
      if (data?.orderId === id || data?._id === id) {
        updateCurrentOrderFromSocket(data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    socket.on("notification", handleNotification);
    socket.on("order_update", handleOrderUpdate);
    socket.on("delivery:status_update", (data: any) => {
      if (data?.orderId === id) {
        fetchOrderDetail(id);
      }
    });

    return () => {
      socket.off("notification", handleNotification);
      socket.off("order_update", handleOrderUpdate);
      socket.off("delivery:status_update");
    };
  }, [socket, id, order?.status]);

  // ── Pulse animation for active step ─────────────────────────────────────────
  useEffect(() => {
    pulseAnim.value = withRepeat(withTiming(1.25, { duration: 800 }), -1, true);
  }, [order?.status]);

  // ── Show review modal on completion ─────────────────────────────────────────
  useEffect(() => {
    if (order?.status === "COMPLETED" && !order?.isReviewed) {
      const timer = setTimeout(() => setShowReviewModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  const currentStepIndex = STEPS.findIndex(s => s.status === order?.status);
  const statusColor = STATUS_COLORS[order?.status || "PENDING"] || Colors.light.primary;

  // ── Cancel ───────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel", style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelOrder(id!, "Cancelled by customer");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert("Cancelled", "Your order has been cancelled.");
          } catch (e: any) {
            Alert.alert("Error", e.message || "Cannot cancel now");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  // ── Review ───────────────────────────────────────────────────────────────────
  const submitReview = async () => {
    try {
      setSubmittingReview(true);
      await api.post("/restaurants/reviews", {
        restaurantId: order?.restaurantId?._id || order?.restaurantId,
        orderId: order?._id,
        rating,
        comment,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thank you! 🙌", "Your review helps restaurants improve.");
      setShowReviewModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Call rider ───────────────────────────────────────────────────────────────
  const callRider = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert("Error", "Cannot open dialer"));
  };

  if (isLoading && !order) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) return null;

  const deliveryInfo = order.deliveryId;
  const isPickedUp = ["PICKED_UP", "ARRIVED"].includes(order.status);
  const canCancel = ["PENDING", "ACCEPTED"].includes(order.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.heroHeader, { backgroundColor: statusColor }]}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.headerTitle}>Order Tracking</Text>
              <Text style={styles.headerId}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Status badge */}
          <View style={styles.statusBadge}>
            <Animated.View style={[styles.statusDot, pulseStyle]} />
            <Text style={styles.statusText}>
              {STEPS[currentStepIndex]?.label || order.status}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── OTP Card (only after pickup) ─────────────────────────────── */}
        {isPickedUp && order.deliveryOtp && (
          <Animated.View entering={SlideInUp} style={styles.otpCard}>
            <View>
              <Text style={styles.otpLabel}>🔐 Delivery OTP</Text>
              <Text style={styles.otpSub}>Share with your delivery partner</Text>
            </View>
            <View style={styles.otpValueBox}>
              {order.deliveryOtp.split("").map((d: string, i: number) => (
                <View key={i} style={styles.otpDigit}>
                  <Text style={styles.otpDigitText}>{d}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── Delivery Partner Card ────────────────────────────────────── */}
        {deliveryInfo && (
          <Animated.View entering={FadeIn} style={styles.partnerCard}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200" }}
              style={styles.partnerImg}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.partnerName}>{deliveryInfo.rider?.name || "Delivery Partner"}</Text>
              <Text style={styles.partnerSub}>Your Delivery Executive</Text>
              {deliveryInfo.rider?.phone && (
                <Text style={styles.partnerPhone}>{deliveryInfo.rider.phone}</Text>
              )}
            </View>
            {deliveryInfo.rider?.phone && (
              <TouchableOpacity style={styles.callBtn} onPress={() => callRider(deliveryInfo.rider.phone)}>
                <Ionicons name="call" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ── Status Timeline ──────────────────────────────────────────── */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          {STEPS.map((step, index) => {
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === STEPS.length - 1;

            return (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <Animated.View style={[
                    styles.stepCircle,
                    isPast && styles.stepCircleDone,
                    isCurrent && [styles.stepCircleActive, { borderColor: statusColor }],
                    isCurrent && pulseStyle,
                  ]}>
                    <Ionicons
                      name={isPast ? "checkmark" : step.icon as any}
                      size={16}
                      color={isPast ? "#FFF" : isCurrent ? statusColor : "#CCC"}
                    />
                  </Animated.View>
                  {!isLast && (
                    <View style={[styles.stepConnector, isPast && { backgroundColor: statusColor }]} />
                  )}
                </View>
                <View style={[styles.stepContent, !isLast && { paddingBottom: 24 }]}>
                  <Text style={[
                    styles.stepLabel,
                    (isPast || isCurrent) && styles.stepLabelActive,
                    isCurrent && { color: statusColor },
                  ]}>
                    {step.label}
                  </Text>
                  {isCurrent && <Text style={styles.stepDesc}>{step.desc}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Restaurant Info ──────────────────────────────────────────── */}
        {order.restaurantId && (
          <View style={styles.restaurantCard}>
            <Ionicons name="restaurant" size={20} color={Colors.light.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.restaurantName}>
                {order.restaurantId.name || "Restaurant"}
              </Text>
              <Text style={styles.restaurantAddr} numberOfLines={1}>
                {order.restaurantId.address?.line1 || ""}
              </Text>
            </View>
          </View>
        )}

        {/* ── Order Items ──────────────────────────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
          {order.walletAmountUsed && order.walletAmountUsed > 0 ? (
            <View style={styles.itemRow}>
              <Text style={[styles.totalLabel, { color: '#22C55E', fontSize: 12 }]}>Wallet Used</Text>
              <Text style={[styles.totalValue, { color: '#22C55E', fontSize: 12 }]}>−₹{order.walletAmountUsed}</Text>
            </View>
          ) : null}
          <View style={styles.itemRow}>
            <Text style={[styles.totalLabel, { fontSize: 12, color: '#888' }]}>Payment</Text>
            <Text style={[styles.totalValue, { fontSize: 12, color: '#888' }]}>
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' :
               order.paymentMethod === 'WALLET' ? 'Paid via Wallet' :
               order.paymentMethod === 'PARTIAL_WALLET' ? 'Wallet + Online' : 'Online'}
            </Text>
          </View>
        </View>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {order.status === "COMPLETED" && (
          <TouchableOpacity style={styles.rateBtn} onPress={() => setShowReviewModal(true)}>
            <Ionicons name="star" size={20} color="#FFF" />
            <Text style={styles.rateBtnText}>Rate Your Experience</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <ActivityIndicator color="#EF4444" size="small" /> : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showReviewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInUp} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate your meal 🍽</Text>
            <Text style={styles.modalSub}>
              How was the food from {order?.restaurantId?.name || "the restaurant"}?
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => { setRating(s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <Ionicons name={s <= rating ? "star" : "star-outline"} size={38} color="#FFC107" />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us what you loved (optional)"
              placeholderTextColor="#BBB"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setShowReviewModal(false)}>
                <Text style={styles.skipText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submittingReview && { opacity: 0.7 }]}
                onPress={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit ⭐</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#999", fontSize: 14, fontWeight: "600" },
  heroHeader: { paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#FFF" },
  headerId: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "700", marginTop: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFF" },
  statusText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  scroll: { padding: 16, paddingTop: 20 },
  otpCard: { backgroundColor: "#1E293B", borderRadius: 22, padding: 20, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  otpLabel: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  otpSub: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 },
  otpValueBox: { flexDirection: "row", gap: 8 },
  otpDigit: { width: 38, height: 48, backgroundColor: Colors.light.primary, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  otpDigitText: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  partnerCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  partnerImg: { width: 52, height: 52, borderRadius: 26 },
  partnerName: { fontSize: 15, fontWeight: "800", color: "#111" },
  partnerSub: { fontSize: 12, color: "#888", marginTop: 2 },
  partnerPhone: { fontSize: 12, color: Colors.light.primary, marginTop: 2, fontWeight: "700" },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#22C55E", alignItems: "center", justifyContent: "center" },
  timelineCard: { backgroundColor: "#FFF", borderRadius: 22, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 18 },
  stepRow: { flexDirection: "row" },
  stepLeft: { alignItems: "center", width: 36 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" },
  stepCircleDone: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  stepCircleActive: { borderWidth: 2.5, backgroundColor: "#FFF" },
  stepConnector: { width: 2, flex: 1, backgroundColor: "#E5E7EB", marginVertical: 4 },
  stepContent: { flex: 1, paddingLeft: 14, paddingTop: 5 },
  stepLabel: { fontSize: 14, fontWeight: "700", color: "#CCC" },
  stepLabelActive: { color: "#111", fontWeight: "900" },
  stepDesc: { fontSize: 12, color: "#888", marginTop: 3, fontWeight: "500" },
  restaurantCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  restaurantName: { fontSize: 14, fontWeight: "800", color: "#111" },
  restaurantAddr: { fontSize: 11, color: "#888", marginTop: 2 },
  summaryCard: { backgroundColor: "#FFF", borderRadius: 22, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  itemRow: { flexDirection: "row", marginBottom: 10, alignItems: "center" },
  itemQty: { width: 28, fontSize: 13, fontWeight: "800", color: Colors.light.primary },
  itemName: { flex: 1, fontSize: 13, fontWeight: "600", color: "#444" },
  itemPrice: { fontSize: 13, fontWeight: "700", color: "#111" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  totalLabel: { flex: 1, fontSize: 15, fontWeight: "900", color: "#111" },
  totalValue: { fontSize: 16, fontWeight: "900", color: "#111" },
  rateBtn: { backgroundColor: "#F59E0B", borderRadius: 18, height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 },
  rateBtnText: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  cancelBtn: { backgroundColor: "#FFF", borderRadius: 18, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, borderWidth: 1.5, borderColor: "#FEE2E2" },
  cancelBtnText: { color: "#EF4444", fontSize: 15, fontWeight: "800" },
  btnDisabled: { opacity: 0.45 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 28, padding: 28, width: "100%", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#111" },
  modalSub: { fontSize: 13, color: "#666", textAlign: "center", marginTop: 8, fontWeight: "500" },
  starsRow: { flexDirection: "row", gap: 8, marginVertical: 22 },
  reviewInput: { width: "100%", backgroundColor: "#F9FAFB", borderRadius: 18, padding: 16, fontSize: 14, color: "#111", height: 100, textAlignVertical: "top", borderWidth: 1, borderColor: "#F3F4F6", marginBottom: 4 },
  modalActions: { flexDirection: "row", width: "100%", gap: 12, marginTop: 20 },
  skipBtn: { flex: 1, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6" },
  skipText: { fontSize: 14, fontWeight: "800", color: "#666" },
  submitBtn: { flex: 2, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primary },
  submitText: { fontSize: 15, fontWeight: "900", color: "#FFF" },
});
