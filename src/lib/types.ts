export type OfferType = "HOTEL" | "FLIGHT" | "CAR_RENTAL" | "ACTIVITY";

export type Offer = {
  id: string;
  type: OfferType;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  region: string | null;
  image: string;
  price: number;
  stars: number | null;
  metadata: string | null;
};

export type Booking = {
  id: string;
  userId: string;
  offerId: string;
  walletId?: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  rooms: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingType?: string | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressCity?: string | null;
  addressPostalCode?: string | null;
  addressCountry?: string | null;
  companyName?: string | null;
  companyVatId?: string | null;
  estimatedArrival?: string | null;
  specialRequests?: string | null;
  roomPackageName?: string | null;
  roomMealType?: string | null;
  additionalGuests?: string | null;
  txHash?: string | null;
  paidAt?: string | null;
  createdAt: string;
  offer: Offer;
  wallet?: CryptoWallet | null;
  user?: { name: string; email: string };
};

export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type PaymentStatus = "PENDING" | "AWAITING_CONFIRMATION" | "PAID" | "FAILED" | "REFUNDED";

export type CryptoWallet = {
  id: string;
  currency: string;
  label: string;
  address: string;
  network: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string | null;
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Awaiting Payment",
  AWAITING_CONFIRMATION: "Verifying TX",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  AWAITING_CONFIRMATION: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export const TYPE_LABELS: Record<OfferType, string> = {
  HOTEL: "Hotel",
  FLIGHT: "Flight",
  CAR_RENTAL: "Car Rental",
  ACTIVITY: "Activity",
};

export const TYPE_ROUTES: Record<OfferType, string> = {
  HOTEL: "stays",
  FLIGHT: "flights",
  CAR_RENTAL: "car-rental",
  ACTIVITY: "activities",
};
