export const OrderStatus = {
  Pending: 0,
  Confirmed: 1,
  Preparing: 2,
  Baking: 3,
  Ready: 4,
  OutForDelivery: 5,
  Delivered: 6,
  Cancelled: 7,
} as const;

export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<OrderStatusValue, string> = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Preparing',
  3: 'Baking',
  4: 'Ready',
  5: 'Out for Delivery',
  6: 'Delivered',
  7: 'Cancelled',
};

export const OrderType = { Delivery: 0, Pickup: 1 } as const;
export const PaymentMethod = { CashOnDelivery: 0, Card: 1, UPI: 2, Wallet: 3 } as const;
export const PaymentStatus = { Pending: 0, Paid: 1, Failed: 2, Refunded: 3 } as const;

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatusValue;
  orderType: number;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  paymentStatus: number;
  paymentMethod: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  orderType: number;
  deliveryAddressId?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  paymentMethod: number;
  couponCode?: string;
  notes?: string;
  items: OrderItemRequest[];
}
