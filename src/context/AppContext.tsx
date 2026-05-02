import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Product, CartItem, Order, User, AppNotification } from "../types";
import { seedStorage } from "../constant";
import {
  apiGetCart,
  apiAddCartItem,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
} from "../utils/cartApi";

interface AppContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  createProduct: (product: Omit<Product, "id" | "rating" | "reviews">) => void;
  updateProduct: (productId: string, changes: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  cart: CartItem[];
  cartLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateCartQuantity: (id: string, delta: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  markOrderShipped: (orderId: string) => void;
  notifications: AppNotification[];
  addNotification: (input: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (notificationId: string) => void;
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadOrders(): Order[] {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function loadUser(): User | null {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function loadNotifications(): AppNotification[] {
  return JSON.parse(localStorage.getItem("notifications") || "[]");
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function saveProducts(products: Product[]) {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    seedStorage();
    localStorage.removeItem("products");
    return [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [currentUser, setCurrentUser] = useState<User | null>(loadUser);

  useEffect(() => {
    if (!currentUser) {
      setCart([]);
      return;
    }
    setCartLoading(true);
    apiGetCart()
      .then(setCart)
      .catch(() => setCart([]))
      .finally(() => setCartLoading(false));
  }, [currentUser?.id]); // only re-run when the actual user ID changes

  useEffect(() => { saveUser(currentUser); }, [currentUser]);
  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { saveProducts(products); }, [products]);
  useEffect(() => { saveNotifications(notifications); }, [notifications]);

  const createProduct = (product: Omit<Product, "id" | "rating" | "reviews">) => {
    setProducts((prev) => [{ ...product, id: String(Date.now()), rating: 0, reviews: [] }, ...prev]);
  };

  const updateProduct = (productId: string, changes: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...changes, id: p.id } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addToCart = async (product: Product, quantity = 1): Promise<void> => {
    if (!currentUser) return;

    const existing = cart.find((item) => item.id === product.id);
    const newQuantity = existing ? existing.quantity + quantity : quantity;

    try {
      if (existing) {
        await apiUpdateCartItem(product.id, newQuantity);
      } else {
        await apiAddCartItem(product.id, quantity);
      }
      // Only update local state after API confirms success
      if (existing) {
        setCart((prev) =>
          prev.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item))
        );
      } else {
        setCart((prev) => [
          ...prev,
          { id: product.id, name: product.name, price: product.price, image: product.image, quantity },
        ]);
      }
    } catch (err) {
      console.error("[Cart] addToCart failed:", err);
    }
  };

  const updateCartQuantity = async (id: string, delta: number): Promise<void> => {
    if (!currentUser) return;

    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);

    // Optimistic update
    if (newQty === 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    }

    try {
      if (newQty === 0) {
        await apiRemoveCartItem(id);
      } else {
        await apiUpdateCartItem(id, newQty);
      }
    } catch {
      // Rollback on failure
      const serverCart = await apiGetCart().catch(() => cart);
      setCart(serverCart);
    }
  };

  const removeFromCart = async (id: string): Promise<void> => {
    if (!currentUser) return;

    // Optimistic update
    setCart((prev) => prev.filter((item) => item.id !== id));

    try {
      await apiRemoveCartItem(id);
    } catch {
      const serverCart = await apiGetCart().catch(() => cart);
      setCart(serverCart);
    }
  };

  const clearCart = async (): Promise<void> => {
    setCart([]);
    if (!currentUser) return;
    try {
      await apiClearCart();
    } catch {
      // Non-fatal after checkout — cart is already cleared locally
    }
  };

  const markOrderShipped = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "Shipped" } : order))
    );
  };

  const addNotification = (input: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      { ...input, id: `NTF-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        cart,
        cartLoading,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        setOrders,
        markOrderShipped,
        notifications,
        addNotification,
        markNotificationRead,
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
