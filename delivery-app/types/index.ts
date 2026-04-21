export type DeliveryOrder = {
  id: string;
  orderId: string;
  status: "ASSIGNED" | "PICKED_UP" | "DELIVERED";
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  isAvailable: boolean;
  isOnline: boolean;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  route: {
    pickupAddress: string;
    dropAddress: string;
    pickupCoordinates?: [number, number];
    dropCoordinates?: [number, number];
  };
  restaurant?: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    coordinates?: [number, number];
  } | null;
  customer?: {
    id: string;
    name?: string;
    phone?: string;
    address?: string;
    coordinates?: [number, number];
  } | null;
  order?: {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
    items: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  } | null;
  paymentSummary?: {
    totalAmount: number;
    paymentStatus: string;
  } | null;
  earnings?: {
    estimatedAmount: number;
    finalAmount: number;
    distanceKm: number;
  } | null;
  statusTimeline: Array<{
    label: string;
    done: boolean;
    date?: string | null;
  }>;
};

export type DeliveryDashboard = {
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    currentLocation?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
    lastLocationUpdatedAt?: string | null;
  };
  activeOrder: DeliveryOrder | null;
  assignedOrders: DeliveryOrder[];
  wallet: {
    balance: number;
    heldBalance: number;
    totalEarnings: number;
    totalPaidOut: number;
    pendingPayouts: number;
  };
};

export type WalletOverview = {
  balance: number;
  heldBalance: number;
  totalEarnings: number;
  totalPaidOut: number;
  payoutCount: number;
  pendingPayouts: number;
  completedPayouts: number;
  payouts: Array<{
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
    paymentMethod: {
      type: "UPI" | "BANK_ACCOUNT";
      upiId?: string;
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
  }>;
  transactions: Array<{
    _id: string;
    description: string;
    amount: number;
    balanceAfter: number;
    createdAt: string;
  }>;
};
