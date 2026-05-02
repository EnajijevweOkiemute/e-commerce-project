import { config } from "../config/env";
import { CartItem } from "../types";

const BASE = `${config.apiBaseUrl}/Cart`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  console.log("[Cart] authToken:", token);
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function apiGetCart(): Promise<CartItem[]> {
  console.log("[Cart] GET", BASE);
  const res = await fetch(BASE, { headers: authHeaders() });
  console.log("[Cart] GET response:",res?.status);
  if (!res.ok) throw new Error(`Get cart failed (${res.status})`);
  const data = await res.json();
  console.log("[Cart] GET data:", data);
  const items: unknown[] = Array.isArray(data) ? data : (data?.items ?? []);
  const mapped = items.map((item: any) => ({
    id: item.productId ?? item.id,
    name: item.productName ?? item.name,
    price: item.price,
    image: item.imageUrl ?? item.image ?? "",
    quantity: item.quantity,
  }));
  console.log("[Cart] GET mapped items:",JSON.stringify( mapped, null, 2));
  return mapped;
}

export async function apiAddCartItem(productId: string, quantity: number): Promise<void> {
  const body = { productId, quantity };
  console.log("[Cart] POST /items", body);
  const res = await fetch(`${BASE}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  console.log("[Cart] POST /items response:", res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Cart] POST /items error:", text);
    throw new Error(text || `Add to cart failed (${res.status})`);
  }
}

export async function apiUpdateCartItem(productId: string, quantity: number): Promise<void> {
  const body = { productId, quantity };
  console.log(`[Cart] PUT /items/${productId}`, body);
  const res = await fetch(`${BASE}/items/${productId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  console.log(`[Cart] PUT /items/${productId} response:`, res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[Cart] PUT /items/${productId} error:`, text);
    throw new Error(text || `Update cart item failed (${res.status})`);
  }
}

export async function apiRemoveCartItem(productId: string): Promise<void> {
  console.log(`[Cart] DELETE /items/${productId}`);
  const res = await fetch(`${BASE}/items/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  console.log(`[Cart] DELETE /items/${productId} response:`, res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[Cart] DELETE /items/${productId} error:`, text);
    throw new Error(text || `Remove cart item failed (${res.status})`);
  }
}

export async function apiClearCart(): Promise<void> {
  console.log("[Cart] DELETE", BASE);
  const res = await fetch(BASE, {
    method: "DELETE",
    headers: authHeaders(),
  });
  console.log("[Cart] DELETE response:", res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[Cart] DELETE error:", text);
    throw new Error(text || `Clear cart failed (${res.status})`);
  }
}
