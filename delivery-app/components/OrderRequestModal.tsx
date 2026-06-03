import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/format";
import { Colors, Spacing, Radius } from "../constants/Colors";

interface OrderRequestModalProps {
  request: any;
  onAccept: (orderId: string) => Promise<void>;
  onReject: () => void;
}

export const OrderRequestModal = ({
  request,
  onAccept,
  onReject,
}: OrderRequestModalProps) => {
  const [timer, setTimer] = useState(request?.expiresIn || 30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!request) return;

    const interval = setInterval(() => {
      setTimer((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [request, onReject]);

  if (!request) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept(request.orderId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>New Delivery Request</Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.row}>
              <Ionicons name="restaurant-outline" size={20} color={Colors.light.textMuted} />
              <Text style={styles.restaurantName}>{request.restaurantName}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="location-outline" size={20} color={Colors.light.textMuted} />
              <Text style={styles.address}>{request.pickupAddress}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{request.distanceKm} km</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Earnings</Text>
                <Text style={[styles.statValue, styles.earnings]}>
                  {formatCurrency(request.earnings)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={onReject}
              disabled={loading}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={styles.acceptText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  timerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  body: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  address: {
    fontSize: 14,
    color: Colors.light.textMuted,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  earnings: {
    color: Colors.light.success,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  rejectText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textMuted,
  },
  acceptButton: {
    flex: 2,
    padding: 16,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.success,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.white,
  },
});