import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { Toast } from "../../component/ui/Toast";
import {
  fetchCategories,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  apiFetchAllProducts,
  apiProductToProduct,
  Category,
} from "../../utils/productApi";
import "./adminDashBoard.css";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  price: "",
  stock: "",
  description: "",
};

const ADMIN_PRODUCTS_PER_PAGE = 5;

function AdminDashBoard() {
  const {
    currentUser,
    products,
    setProducts,
    orders,
    transactions,
    createProduct,
    updateProduct,
    deleteProduct,
    markOrderDelivered,
  } = useAppContext();

  const [productForm, setProductForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editImageFiles, setEditImageFiles] = useState<Record<string, File>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<{ name: string; description: string; price: any; stock: any; categoryId: string }>>>({});

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; description: string } | null>(null);
  const [categoryBusyIds, setCategoryBusyIds] = useState<Set<string>>(new Set());
  const [productPage, setProductPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );
  const failedTransactions = transactions.filter((transaction) => transaction.status === "Failed").length;
  const totalProductPages = Math.max(1, Math.ceil(products.length / ADMIN_PRODUCTS_PER_PAGE));
  const activeProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = products.slice(
    (activeProductPage - 1) * ADMIN_PRODUCTS_PER_PAGE,
    activeProductPage * ADMIN_PRODUCTS_PER_PAGE,
  );

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setToast({ message: "Could not load categories.", type: "error" }));
  }, []);

  useEffect(() => {
    apiFetchAllProducts(100)
      .then((apiProducts) => setProducts(apiProducts.map(apiProductToProduct)))
      .catch(() => setToast({ message: "Could not load products.", type: "error" }));
  }, [setProducts]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "admin") return <Navigate to="/dashboard" replace />;

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile) {
      setToast({ message: "Please select a product image.", type: "error" });
      return;
    }
    if (!productForm.categoryId) {
      setToast({ message: "Please select a category.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const category = categories.find((c) => c.id === productForm.categoryId);
      await apiCreateProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        stockQuantity: Number(productForm.stock),
        categoryId: productForm.categoryId,
        image: imageFile,
      });
      createProduct({
        name: productForm.name.trim(),
        category: category?.name ?? productForm.categoryId,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image: imagePreview,
        description: productForm.description.trim(),
      });

      setProductForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setToast({ message: "Product created successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to create product.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const setPendingEdit = (productId: string, changes: Partial<typeof pendingEdits[string]>) => {
    setPendingEdits((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...changes },
    }));
  };

  const handleSaveProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const edits = pendingEdits[productId] ?? {};
    const category = categories.find((c) => c.id === (edits.categoryId ?? ""));

    setSavingIds((prev) => new Set(prev).add(productId));
    try {
      await apiUpdateProduct(productId, {
        name: edits.name ?? product.name,
        description: edits.description ?? product.description,
        price: edits.price ?? product.price,
        stockQuantity: edits.stock ?? product.stock,
        categoryId: edits.categoryId ?? categories.find((c) => c.name === product.category)?.id ?? "",
        image: editImageFiles[productId] ?? null,
      });
      updateProduct(productId, {
        ...(edits.name !== undefined && { name: edits.name }),
        ...(edits.description !== undefined && { description: edits.description }),
        ...(edits.price !== undefined && { price: edits.price }),
        ...(edits.stock !== undefined && { stock: edits.stock }),
        ...(category && { category: category.name }),
        ...(editImageFiles[productId] && { image: URL.createObjectURL(editImageFiles[productId]) }),
      });

      setPendingEdits((prev) => { const next = { ...prev }; delete next[productId]; return next; });
      setEditImageFiles((prev) => { const next = { ...prev }; delete next[productId]; return next; });
      setToast({ message: "Product updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to update product.", type: "error" });
    } finally {
      setSavingIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setSavingIds((prev) => new Set(prev).add(productId));
    try {
      await apiDeleteProduct(productId);
      deleteProduct(productId);
      setToast({ message: "Product deleted.", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to delete product.", type: "error" });
    } finally {
      setSavingIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  return (
    <section className="admin-section">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <span className="admin-eyebrow">Admin Dashboard</span>
            <h1 className="admin-title">Store Control Center</h1>
            <p className="admin-subtitle">
              Manage inventory, track order activity, and mark shipments as completed.
            </p>
          </div>
          <Link className="admin-cta" to="/shop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            View Storefront
          </Link>
        </div>

        {/* Metrics */}
        <div className="admin-metrics">
          <div className="admin-metric-card">
            <div className="admin-metric-icon admin-metric-icon--products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Total Products</span>
              <strong className="admin-metric-value">{products.length}</strong>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon admin-metric-icon--orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Total Orders</span>
              <strong className="admin-metric-value">{orders.length}</strong>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon admin-metric-icon--revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Total Revenue</span>
              <strong className="admin-metric-value">${totalRevenue.toFixed(0)}</strong>
            </div>
          </div>

          <Link className="admin-metric-card admin-metric-card--link" to="/transactions">
            <div className="admin-metric-icon admin-metric-icon--transactions">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
                <path d="M7 15h.01"></path>
                <path d="M11 15h4"></path>
              </svg>
            </div>
            <div className="admin-metric-content">
              <span className="admin-metric-label">Transactions</span>
              <strong className="admin-metric-value">{transactions.length}</strong>
            </div>
          </Link>
        </div>

        <div className="admin-card admin-card--transaction-link">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-eyebrow">Payments</span>
              <h3 className="admin-card-title">Transaction History</h3>
            </div>
            {failedTransactions > 0 && (
              <span className="admin-status-badge admin-status-badge--failed">
                {failedTransactions} failed
              </span>
            )}
          </div>
          <div className="admin-card-body admin-transaction-link-body">
            <p>
              Review successful and failed payment attempts across customers and download transaction receipts.
            </p>
            <Link className="admin-order-btn admin-transaction-link-btn" to="/transactions">
              View transactions
            </Link>
          </div>
        </div>

        <div className="admin-main-grid admin-main-grid--3">
          {/* Create Category */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-eyebrow">Catalogue</span>
                <h3 className="admin-card-title">Create Category</h3>
              </div>
            </div>
            <div className="admin-card-body">
              <form
                className="admin-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCreatingCategory(true);
                  try {
                    const created = await apiCreateCategory(
                      categoryForm.name.trim(),
                      categoryForm.description.trim()
                    );
                    setCategories((prev) => [...prev, created]);
                    setCategoryForm({ name: "", description: "" });
                    setToast({ message: "Category created!", type: "success" });
                  } catch (err) {
                    setToast({ message: err instanceof Error ? err.message : "Failed to create category.", type: "error" });
                  } finally {
                    setCreatingCategory(false);
                  }
                }}
              >
                <div className="admin-form-field">
                  <label htmlFor="cat-name">Category Name</label>
                  <input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Watches"
                    required
                    disabled={creatingCategory}
                  />
                </div>
                <div className="admin-form-field">
                  <label htmlFor="cat-desc">Description</label>
                  <textarea
                    id="cat-desc"
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Short description of this category…"
                    disabled={creatingCategory}
                  />
                </div>
                <button className="admin-form-submit" type="submit" disabled={creatingCategory}>
                  {creatingCategory ? <span className="admin-spinner" /> : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                  {creatingCategory ? "Creating…" : "Create Category"}
                </button>

                {categories.length > 0 && (
                  <div className="admin-category-list">
                    <p className="admin-category-list-label">Existing categories</p>
                    {categories.map((c) => {
                      const isBusy = categoryBusyIds.has(c.id);
                      const isEditing = editingCategory?.id === c.id;
                      return (
                        <div key={c.id} className="admin-category-row">
                          {isEditing ? (
                            <>
                              <input
                                className="admin-category-edit-input"
                                value={editingCategory.name}
                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                disabled={isBusy}
                              />
                              <input
                                className="admin-category-edit-input"
                                value={editingCategory.description}
                                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                placeholder="Description"
                                disabled={isBusy}
                              />
                              <div className="admin-category-row-actions">
                                <button
                                  type="button"
                                  className="admin-category-save-btn"
                                  disabled={isBusy}
                                  onClick={async () => {
                                    setCategoryBusyIds((prev) => new Set(prev).add(c.id));
                                    try {
                                      await apiUpdateCategory(c.id, editingCategory.name.trim(), editingCategory.description.trim());
                                      setCategories((prev) => prev.map((cat) => cat.id === c.id ? { ...cat, name: editingCategory.name.trim() } : cat));
                                      setEditingCategory(null);
                                      setToast({ message: "Category updated!", type: "success" });
                                    } catch (err) {
                                      setToast({ message: err instanceof Error ? err.message : "Failed to update category.", type: "error" });
                                    } finally {
                                      setCategoryBusyIds((prev) => { const next = new Set(prev); next.delete(c.id); return next; });
                                    }
                                  }}
                                >
                                  {isBusy ? <span className="admin-spinner admin-spinner--sm" /> : "Save"}
                                </button>
                                <button type="button" className="admin-category-cancel-btn" onClick={() => setEditingCategory(null)} disabled={isBusy}>Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="admin-category-chip">{c.name}</span>
                              <div className="admin-category-row-actions">
                                <button
                                  type="button"
                                  className="admin-category-edit-btn"
                                  onClick={() => setEditingCategory({ id: c.id, name: c.name, description: "" })}
                                  disabled={isBusy}
                                  aria-label="Edit category"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="admin-category-delete-btn"
                                  disabled={isBusy}
                                  aria-label="Delete category"
                                  onClick={async () => {
                                    if (!confirm(`Delete category "${c.name}"?`)) return;
                                    setCategoryBusyIds((prev) => new Set(prev).add(c.id));
                                    try {
                                      await apiDeleteCategory(c.id);
                                      setCategories((prev) => prev.filter((cat) => cat.id !== c.id));
                                      setToast({ message: "Category deleted.", type: "success" });
                                    } catch (err) {
                                      setToast({ message: err instanceof Error ? err.message : "Failed to delete category.", type: "error" });
                                    } finally {
                                      setCategoryBusyIds((prev) => { const next = new Set(prev); next.delete(c.id); return next; });
                                    }
                                  }}
                                >
                                  {isBusy ? <span className="admin-spinner admin-spinner--sm" /> : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </form>
            </div>
          </div>
          {/* Add Product Form */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-eyebrow">Inventory Control</span>
                <h3 className="admin-card-title">Add New Product</h3>
              </div>
            </div>
            <div className="admin-card-body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label htmlFor="product-name">Product Name</label>
                    <input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Classic Leather Watch"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="admin-form-field">
                    <label htmlFor="product-category">Category</label>
                    <select
                      id="product-category"
                      className="admin-form-select"
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label htmlFor="product-price">Price ($)</label>
                    <input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e?.target.value })}
                      placeholder="299"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="admin-form-field">
                    <label htmlFor="product-stock">Stock</label>
                    <input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="15"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="product-image">Product Image</label>
                  <div
                    className="admin-file-drop"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) handleImageChange(file);
                    }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="admin-file-preview" />
                    ) : (
                      <div className="admin-file-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>Click or drag to upload image</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  {imageFile && (
                    <button
                      type="button"
                      className="admin-file-clear"
                      onClick={() => { handleImageChange(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    >
                      Remove image
                    </button>
                  )}
                </div>

                <div className="admin-form-field">
                  <label htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Elegant timepiece with genuine leather strap..."
                    required
                    disabled={submitting}
                  />
                </div>

                <button className="admin-form-submit" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="admin-spinner" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                  {submitting ? "Adding…" : "Add Product"}
                </button>
              </form>
            </div>
          </div>

          {/* Orders List */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-eyebrow">Order Management</span>
                <h3 className="admin-card-title">Recent Customer Orders</h3>
              </div>
            </div>
            <div className="admin-card-body">
              {orders.length ? (
                <div className="admin-orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <div className="admin-order-item" key={order.id}>
                      <div className="admin-order-header">
                        <div>
                          <strong className="admin-order-id">{order.id}</strong>
                          <p className="admin-order-customer">
                            {order.customer.name} • {order.customer.email}
                          </p>
                        </div>
                        <span className={`admin-status-badge admin-status-badge--${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="admin-order-meta">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })} • {order.items.length} item(s)
                      </p>
                      <div className="admin-order-items">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.id}`} className="admin-order-item-row">
                            <span>{item.name}</span>
                            <strong>{item.quantity} × ${item.price}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="admin-order-footer">
                        <strong className="admin-order-total">${order.total.toFixed(0)}</strong>
                        <button
                          className={`admin-order-btn ${order.status === "Delivered" ? "admin-order-btn--disabled" : ""}`}
                          type="button"
                          onClick={() => markOrderDelivered(order.id)}
                          disabled={order.status === "Delivered"}
                        >
                          {order.status === "Delivered" ? "Delivered" : "Mark as Delivered"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                  <p>Orders will appear here after customers complete checkout.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="admin-card admin-card--full">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-eyebrow">Inventory</span>
              <h3 className="admin-card-title">Manage Existing Products</h3>
            </div>
            <span className="admin-product-count">{products.length} Products</span>
          </div>
          <div className="admin-card-body">
            <div className="admin-inventory-grid">
              {paginatedProducts.map((product) => {
                const isBusy = savingIds.has(product.id);
                const edits = pendingEdits[product.id] ?? {};
                const hasEdits = Object.keys(edits).length > 0 || !!editImageFiles[product.id];

                const effectiveName = (edits.name ?? product.name).trim();
                const effectiveDesc = (edits.description ?? product.description).trim();
                const effectivePrice = edits.price ?? product.price;
                const effectiveStock = edits.stock ?? product.stock;
                const effectiveCategoryId = edits.categoryId ?? categories.find((c) => c.name === product.category)?.id ?? "";

                const canSave =
                  hasEdits &&
                  effectiveName !== "" &&
                  effectiveDesc !== "" &&
                  Number(effectivePrice) > 0 &&
                  Number(effectiveStock) >= 0 &&
                  effectiveCategoryId !== "";

                return (
                  <div className="admin-inventory-item" key={product.id}>
                    <div className="admin-inventory-image-wrap">
                      <img
                        src={editImageFiles[product.id] ? URL.createObjectURL(editImageFiles[product.id]) : product.image}
                        alt={product.name}
                        className="admin-inventory-image"
                      />
                      <label className="admin-inventory-image-btn" title="Change image">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setEditImageFiles((prev) => ({ ...prev, [product.id]: file }));
                          }}
                        />
                      </label>
                    </div>
                    <div className="admin-inventory-content">
                      <input
                        className="admin-inventory-name"
                        value={edits.name ?? product.name}
                        onChange={(e) => setPendingEdit(product.id, { name: e.target.value })}
                        disabled={isBusy}
                      />
                      <textarea
                        className="admin-inventory-desc"
                        rows={2}
                        value={edits.description ?? product.description}
                        onChange={(e) => setPendingEdit(product.id, { description: e.target.value })}
                        disabled={isBusy}
                      />
                      <div className="admin-inventory-fields">
                        <div className="admin-inventory-field">
                          <label>Price</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={edits.price ?? product.price}
                            onChange={(e) => setPendingEdit(product.id, { price: e.target.value})}
                            disabled={isBusy}
                          />
                        </div>
                        <div className="admin-inventory-field">
                          <label>Stock</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={edits.stock ?? product.stock}
                            onChange={(e) => setPendingEdit(product.id, { stock: e.target.value})}
                            disabled={isBusy}
                          />
                        </div>
                      </div>
                      {categories.length > 0 && (
                        <div className="admin-inventory-field">
                          <label>Category</label>
                          <select
                            className="admin-inventory-select"
                            value={edits.categoryId ?? categories.find((c) => c.name === product.category)?.id ?? ""}
                            onChange={(e) => setPendingEdit(product.id, { categoryId: e.target.value })}
                            disabled={isBusy}
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="admin-inventory-actions">
                      <button
                        className={`admin-inventory-save ${!canSave ? "admin-inventory-save--dim" : ""}`}
                        type="button"
                        onClick={() => handleSaveProduct(product.id)}
                        disabled={isBusy || !canSave}
                        aria-label="Save changes"
                      >
                        {isBusy ? <span className="admin-spinner admin-spinner--sm" /> : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                        )}
                        UPDATE
                      </button>
                      <button
                        className="admin-inventory-delete"
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isBusy}
                        aria-label="Delete product"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {products.length > ADMIN_PRODUCTS_PER_PAGE && (
              <nav className="admin-pagination" aria-label="Admin product pages">
                <button
                  className="admin-pagination-button"
                  type="button"
                  onClick={() => setProductPage((page) => Math.max(1, page - 1))}
                  disabled={activeProductPage === 1}
                >
                  Previous
                </button>
                <div className="admin-pagination-numbers">
                  {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => (
                    <button
                      className={`admin-pagination-number ${page === activeProductPage ? "admin-pagination-number--active" : ""}`}
                      type="button"
                      key={page}
                      aria-current={page === activeProductPage ? "page" : undefined}
                      onClick={() => setProductPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="admin-pagination-button"
                  type="button"
                  onClick={() => setProductPage((page) => Math.min(totalProductPages, page + 1))}
                  disabled={activeProductPage === totalProductPages}
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashBoard;
