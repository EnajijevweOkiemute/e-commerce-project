import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product, CartItem, Order, User } from "../types";
import { seedStorage } from "../constant";

interface AppContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadProducts(): Product[] {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

function loadCart(): CartItem[] {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function loadOrders(): Order[] {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function loadUser(): User | null {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(items));
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return;
  }
  localStorage.removeItem("currentUser");
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    seedStorage();
    setProducts(loadProducts());
    setCart(loadCart());
    setOrders(loadOrders());
    setCurrentUser(loadUser());
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    });
  };

  const updateCartQuantity = (id: string, direction: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== id) return item;
          return { ...item, quantity: Math.max(0, item.quantity + direction) };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        setOrders,
        currentUser,
        setCurrentUser,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
