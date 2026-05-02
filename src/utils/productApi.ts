import { config } from "../config/env";

const BASE = `${config.apiBaseUrl}/Product`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface Category {
  id: string;
  name: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${config.apiBaseUrl}/Category`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function apiCreateCategory(name: string, description: string): Promise<Category> {
  const res = await fetch(`${config.apiBaseUrl}/Category`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Create category failed (${res.status})`);
  }
  return res.json();
}

export async function apiCreateProduct(data: {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  image: File;
}) {
  const form = new FormData();
  form.append("Name", data.name);
  form.append("Description", data.description);
  form.append("Price", String(data.price));
  form.append("StockQuantity", String(data.stockQuantity));
  form.append("CategoryId", data.categoryId);
  form.append("Image", data.image);

  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Create failed (${res.status})`);
  }
  return res.json().catch(() => null);
}

export async function apiUpdateProduct(
  productId: string,
  data: {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: string;
    image?: File | null;
  }
) {
  const form = new FormData();
  form.append("Name", data.name);
  form.append("Description", data.description);
  form.append("Price", String(data.price));
  form.append("StockQuantity", String(data.stockQuantity));
  form.append("CategoryId", data.categoryId);
  if (data.image) form.append("Image", data.image);

  const res = await fetch(`${BASE}/${productId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Update failed (${res.status})`);
  }
  return res.json().catch(() => null);
}

export async function apiDeleteProduct(productId: string) {
  const res = await fetch(`${BASE}/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Delete failed (${res.status})`);
  }
}
