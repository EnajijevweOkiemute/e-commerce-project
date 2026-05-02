import { config } from "../config/env";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ApiOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
  }[];
}

export async function apiCheckout(shippingAddress: string, callbackUrl: string) {
  const res = await fetch(`${config.apiBaseUrl}/Order/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ shippingAddress, callbackUrl }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Checkout failed (${res.status})`);
  }
  return res.json().catch(() => null);
}

export async function apiFetchMyOrders(page = 1, pageSize = 10): Promise<ApiOrder[]> {
  const res = await fetch(
    `${config.apiBaseUrl}/Order/my-orders?page=${page}&pageSize=${pageSize}`,
    { headers: authHeaders() }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch orders (${res.status})`);
  }
  const data = await res.json();
  // API may return { items: [...] } or a plain array
  return Array.isArray(data) ? data : (data.items ?? data.orders ?? []);
}
