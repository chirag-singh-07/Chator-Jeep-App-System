import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
} from "react-native";
import { useOrderStore } from "../store/useOrderStore";
import { useAudioPlayer } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

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

  return (
    <Modal visible={!!incomingOrder} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.pulseIndicator} />
            <Text style={styles.title}>NEW ORDER ALERT</Text>
          </View>

          <Text style={styles.orderId}>
            #
            {incomingOrder.orderNumber ||
              incomingOrder._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.totalAmount}>₹{incomingOrder.totalAmount}</Text>

          <View style={styles.itemBox}>
            {incomingOrder.items?.map((item, idx) => (
              <Text key={idx} style={styles.itemText}>
                {item.quantity}x {item.name}
              </Text>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.rejectBtn]}
              onPress={() => rejectOrder(incomingOrder._id)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptBtn]}
              onPress={() => acceptOrder(incomingOrder._id, 20)}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            Alarm will ring until responded.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    backgroundColor: "#FFF2F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.error,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.light.error,
    letterSpacing: 2,
  },
  orderId: {
    fontSize: 16,
    color: Colors.light.textMuted,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: "900",
    color: Colors.light.text,
    marginVertical: 10,
  },
  itemBox: {
    backgroundColor: "#F8F8F8",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    marginVertical: 20,
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
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
  },
  rejectBtn: {
    backgroundColor: "#FF4B4B",
  },
  acceptBtn: {
    backgroundColor: Colors.light.success,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "black",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "bold",
  },
});
