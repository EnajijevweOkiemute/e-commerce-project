import { config } from "../config/env";
import { Product } from "../types";

const BASE = `${config.apiBaseUrl}/Product`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface Category {
  id: string;
  name: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  createdDate: string;
  updatedDate: string | null;
}

export interface ProductPage {
  items: ApiProduct[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function apiProductToProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    category: apiProduct.categoryName,
    price: apiProduct.price,
    image: apiProduct.imageUrl,
    stock: apiProduct.stockQuantity,
    rating: 0,
    reviews: [],
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${config.apiBaseUrl}/Category`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch categories (${res.status})`);
  }
  return res.json();
}

export async function apiFetchProducts(page = 1, pageSize = 100): Promise<ProductPage> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch products (${res.status})`);
  }
  return res.json();
}

export async function apiFetchAllProducts(pageSize = 100): Promise<ApiProduct[]> {
  const firstPage = await apiFetchProducts(1, pageSize);
  if (firstPage.totalPages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      apiFetchProducts(index + 2, pageSize),
    ),
  );

  return [
    ...firstPage.items,
    ...remainingPages.flatMap((page) => page.items),
  ];
}

export async function apiUpdateCategory(
  id: string,
  name: string,
  description: string,
): Promise<void> {
  const res = await fetch(`${config.apiBaseUrl}/Category/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Update category failed (${res.status})`);
  }
}

export async function apiDeleteCategory(id: string): Promise<void> {
  const res = await fetch(`${config.apiBaseUrl}/Category/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Delete category failed (${res.status})`);
  }
}

export async function apiCreateCategory(
  name: string,
  description: string,
): Promise<Category> {
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
  },
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
