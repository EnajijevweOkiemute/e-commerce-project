import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Product, CartItem, Order, User, AppNotification, Transaction } from "../types";
import { seedStorage } from "../constant";

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
  replaceCart: (items: CartItem[]) => Promise<void>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  markOrderDelivered: (orderId: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
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
const GUEST_CART_KEY = "cart";
const USER_CART_PREFIX = "cart:";

function loadOrders(): Order[] {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function loadTransactions(): Transaction[] {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
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

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function saveProducts(products: Product[]) {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

function cartStorageKey(userId?: string | null) {
  return userId ? `${USER_CART_PREFIX}${userId}` : GUEST_CART_KEY;
}

function normalizeCart(cart: CartItem[]): CartItem[] {
  return cart
    .filter((item) => item?.id && Number(item.quantity) > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || "",
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    }));
}

function loadCart(userId?: string | null): CartItem[] {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(cartStorageKey(userId)) || "[]"));
  } catch {
    return [];
  }
}

function saveCart(key: string, cart: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(normalizeCart(cart)));
}

function mergeCarts(primary: CartItem[], secondary: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  [...primary, ...secondary].forEach((item) => {
    const existing = merged.get(item.id);
    merged.set(item.id, {
      ...item,
      quantity: (existing?.quantity || 0) + item.quantity,
    });
  });

  return Array.from(merged.values());
}

export function AppProvider({ children }: { children: ReactNode }) {
  const loadedUser = loadUser();
  const [products, setProducts] = useState<Product[]>(() => {
    seedStorage();
    localStorage.removeItem("products");
    return [];
  });
  const [cart, setCart] = useState<CartItem[]>(() => loadCart(loadedUser?.id));
  const [activeCartKey, setActiveCartKey] = useState(() => cartStorageKey(loadedUser?.id));
  const [cartLoading, setCartLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [currentUser, setCurrentUser] = useState<User | null>(loadedUser);

  useEffect(() => {
    const nextKey = cartStorageKey(currentUser?.id);
    setCartLoading(true);
    setActiveCartKey(nextKey);

    if (currentUser) {
      const userCart = loadCart(currentUser.id);
      const guestCart = loadCart(null);
      const mergedCart = mergeCarts(userCart, guestCart);

      if (guestCart.length > 0) {
        localStorage.removeItem(GUEST_CART_KEY);
      }

      setCart(mergedCart);
    } else {
      setCart(loadCart(null));
    }

    setCartLoading(false);
  }, [currentUser?.id]); // only re-run when the actual user ID changes

  useEffect(() => { saveUser(currentUser); }, [currentUser]);
  useEffect(() => {
    if (activeCartKey === cartStorageKey(currentUser?.id)) {
      saveCart(activeCartKey, cart);
    }
  }, [activeCartKey, cart, currentUser?.id]);
  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { saveTransactions(transactions); }, [transactions]);
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
    const parsedQuantity = Math.floor(Number(quantity));
    const safeQuantity = Number.isFinite(parsedQuantity) ? Math.max(1, parsedQuantity) : 1;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item,
        );
      }

      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, image: product.image, quantity: safeQuantity },
      ];
    });
  };

  const updateCartQuantity = async (id: string, delta: number): Promise<void> => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = async (id: string): Promise<void> => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const replaceCart = async (items: CartItem[]): Promise<void> => {
    setCart(normalizeCart(items));
  };

  const clearCart = async (): Promise<void> => {
    setCart([]);
  };

  const markOrderDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "Delivered" } : order))
    );
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [
      transaction,
      ...prev.filter((item) => item.id !== transaction.id),
    ]);
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
        replaceCart,
        clearCart,
        orders,
        setOrders,
        markOrderDelivered,
        transactions,
        addTransaction,
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
