export type PartnerStatus = "pending" | "approved" | "rejected" | "blocked";

export type DeliveryPartnerProfile = {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePhoto?: string;
  vehicleType: "Bike" | "Cycle" | "Car";
  vehicleFuelType?: "Petrol" | "EV";
  bikeNumber?: string;
  drivingLicense?: string;
  documents?: {
    aadhaarNumber?: string;
    aadhaarPhoto?: string;
    drivingLicenseNumber?: string;
    drivingLicensePhoto?: string;
    livePhoto?: string;
  };
  address?: {
    buildingName?: string;
    streetName?: string;
    landmark?: string;
    area?: string;
    state?: string;
    city?: string;
  };
  payoutMethod?: "UPI" | "BANK_ACCOUNT";
  upiId?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  termsAccepted?: boolean;
  status: PartnerStatus;
  isOnline: boolean;
  currentOrderId?: string | null;
  adminRemarks?: string;
};

export type DeliveryOrder = {
  id: string;
  orderId: string;
  status: "ACCEPTED" | "PICKED_UP" | "ARRIVED" | "COMPLETED";
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  deliveryOtp?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
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
