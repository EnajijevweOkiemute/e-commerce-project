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
  card: string;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  status: string;
  items: CartItem[];
  customer: CheckoutCustomer;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}
