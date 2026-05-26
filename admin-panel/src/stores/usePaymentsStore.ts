import { create } from "zustand";
import { adminService } from "@/services/admin.service";

export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED" | "PENDING" | "FAILED";
export type PaymentMethod = "COD" | "ONLINE" | "WALLET" | "PARTIAL_WALLET";

export interface PaymentRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone?: string;
  };
  restaurantId: {
    _id: string;
    name: string;
  };
  totalAmount: number;
  foodAmount: number;
  deliveryFee: number;
  couponDiscount: number;
  commissionAmount: number;
  platformFee: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentGateway?: "PHONEPE" | "RAZORPAY" | null;
  razorpayPaymentId?: string;
  phonepeTransactionId?: string;
  walletAmountUsed?: number;
  couponCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  settledRevenue: number;
  pendingCOD: number;
  refundedAmount: number;
  platformEarnings: number;
  orderCount: number;
  averageOrderValue: number;
}

interface PaymentsState {
  payments: PaymentRecord[];
  loading: boolean;
  error: string | null;
  stats: PaymentStats | null;
  statsLoading: boolean;
  filters: {
    status: string;
    method: string;
    page: number;
    search: string;
    startDate: string;
    endDate: string;
  };
  total: number;
  gatewayConfig: {
    activeGateway: string;
    availableGateways: string[];
    businessName: string;
  } | null;

  fetchPayments: () => Promise<void>;
  fetchPaymentStats: () => Promise<void>;
  fetchGatewayConfig: () => Promise<void>;
  setFilters: (filters: Partial<PaymentsState["filters"]>) => void;
  updatePaymentStatus: (orderId: string, status: string) => Promise<void>;
  processRefund: (orderId: string, amount: number, reason: string) => Promise<void>;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
  filters: {
    status: "all",
    method: "all",
    page: 1,
    search: "",
    startDate: "",
    endDate: "",
  },
  total: 0,
  gatewayConfig: null,

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  fetchPayments: async () => {
    set({ loading: true, error: null });
    try {
      const { status, method, page, search, startDate, endDate } = get().filters;
      const response = await adminService.getPayments({ status, method, page, search, startDate, endDate });
      if (response.success) {
        set({
          payments: response.orders,
          total: response.pagination?.total || 0,
          loading: false
        });
      } else {
        set({ error: response.message || "Failed to fetch payments", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", loading: false });
    }
  },

  fetchPaymentStats: async () => {
    set({ statsLoading: true });
    try {
      const response = await adminService.getPaymentStats();
      if (response.success) {
        set({ stats: response.data, statsLoading: false });
      } else {
        set({ statsLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch payment stats:", err);
      set({ statsLoading: false });
    }
  },

  fetchGatewayConfig: async () => {
    try {
      const response = await adminService.getPaymentGatewayConfig();
      if (response.success) {
        set({ gatewayConfig: response.data });
      }
    } catch (err) {
      console.error("Failed to fetch gateway config:", err);
    }
  },

  updatePaymentStatus: async (orderId: string, status: string) => {
    // Could add a method to update payment status if needed
    console.log("Updating payment status:", orderId, status);
  },

  processRefund: async (orderId: string, amount: number, reason: string) => {
    try {
      const response = await adminService.initiateRefund(orderId, { amount, reason });
      if (response.success) {
        await get().fetchPayments();
        await get().fetchPaymentStats();
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || "Failed to process refund");
    }
  },
}));