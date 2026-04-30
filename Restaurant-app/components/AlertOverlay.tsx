import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Alert
} from "react-native";
import { useOrderStore } from "../store/useOrderStore";
import { useAudioPlayer } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

export const AlertOverlay = () => {
  const incomingOrder = useOrderStore((state) => state.incomingOrder);
  const acceptOrder = useOrderStore((state) => state.acceptOrder);
  const rejectOrder = useOrderStore((state) => state.rejectOrder);

  // Utilize the SDK 54 compatible expo-audio hook
  const player = useAudioPlayer(require("../assets/audios/order-incoming-sound.wav"));

  useEffect(() => {
    if (incomingOrder) {
      if (player) {
         player.loop = true;
         player.play();
      }
      Vibration.vibrate([0, 1000, 1000], true);
    } else {
      if (player) {
         player.pause();
      }
      Vibration.cancel();
    }

    return () => {
      Vibration.cancel();
    };
  }, [incomingOrder, player]);

  if (!incomingOrder) return null;

  const handleAccept = async () => {
    try {
      await acceptOrder(incomingOrder._id, 20);
      router.push(`/order/${incomingOrder._id}`);
    } catch (e) {
      Alert.alert("Failed", "Could not accept order. Please check your connection.");
    }
  };

  const handleReject = async () => {
    try {
      await rejectOrder(incomingOrder._id);
    } catch (e) {
      Alert.alert("Failed", "Could not reject order. Please check your connection.");
    }
  };

  return (
    <Modal visible={!!incomingOrder} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.pulseIndicator} />
            <Text style={styles.title}>NEW ORDER ALERT</Text>
          </View>

          <Text style={styles.orderId}>
            #{incomingOrder.orderNumber || incomingOrder._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.totalAmount}>₹{incomingOrder.totalAmount}</Text>

          <View style={styles.itemBox}>
            {incomingOrder.items?.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.rejectBtn]} onPress={handleReject}>
              <Ionicons name="close-circle" size={24} color="#FF4B4B" />
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={handleAccept}>
              <Ionicons name="checkmark-circle" size={24} color="#000" />
              <Text style={styles.acceptText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>Alarm will ring until responded.</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#111",
    width: "100%",
    borderRadius: 35,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255, 75, 75, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4B4B",
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FF4B4B",
    letterSpacing: 2,
  },
  orderId: {
    fontSize: 18,
    color: "#888",
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FFF",
    marginVertical: 10,
  },
  itemBox: {
    backgroundColor: "#1A1A1A",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    marginVertical: 20,
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.light.primary,
    backgroundColor: "rgba(255, 204, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 15,
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  rejectBtn: {
    backgroundColor: "transparent",
    borderColor: "#FF4B4B",
  },
  rejectText: {
    color: "#FF4B4B",
    fontSize: 18,
    fontWeight: "900",
  },
  acceptBtn: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  acceptText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
