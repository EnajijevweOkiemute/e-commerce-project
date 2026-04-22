import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Product, CartItem, Order, User, AppNotification } from "../types";
import { seedStorage } from "../constant";

interface AppContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  createProduct: (product: Omit<Product, "id" | "rating" | "reviews">) => void;
  updateProduct: (productId: string, changes: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  markOrderShipped: (orderId: string) => void;
  notifications: AppNotification[];
  addNotification: (input: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (notificationId: string) => void;
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
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

function loadNotifications(): AppNotification[] {
  return JSON.parse(localStorage.getItem("notifications") || "[]");
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

function saveProducts(products: Product[]) {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    seedStorage();
    return loadProducts();
  });
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [currentUser, setCurrentUser] = useState<User | null>(loadUser);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const createProduct = (product: Omit<Product, "id" | "rating" | "reviews">) => {
    setProducts((currentProducts) => [
      {
        ...product,
        id: String(Date.now()),
        rating: 0,
        reviews: [],
      },
      ...currentProducts,
    ]);
  };

  const updateProduct = (productId: string, changes: Partial<Product>) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, ...changes, id: product.id } : product,
      ),
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  };

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

  const markOrderShipped = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Shipped" } : order,
      ),
    );
  };

  const addNotification = (input: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((currentNotifications) => [
      {
        ...input,
        id: `NTF-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...currentNotifications,
    ]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
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
