export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  rating: number;
  reviews: Review[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  card?: string;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  status: string;
  paymentStatus?: "Pending" | "Paid";
  paymentReference?: string;
  items: CartItem[];
  customer: CheckoutCustomer;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export interface StoredUser extends User {
  password: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export interface PasswordResetEmail {
  id: string;
  to: string;
  subject: string;
  resetLink: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "order" | "payment" | "system";
}
