import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./adminDashBoard.css";

function AdminDashBoard() {
  const {
    currentUser,
    products,
    orders,
    createProduct,
    updateProduct,
    deleteProduct,
    markOrderShipped,
  } = useAppContext();

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProduct({
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      image: productForm.image.trim(),
      description: productForm.description.trim(),
    });
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      description: "",
    });
  };

  return (
    <section className="admin-section">
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
        </div>

        {/* Main Grid */}
        <div className="admin-main-grid">
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
                    />
                  </div>
                  <div className="admin-form-field">
                    <label htmlFor="product-category">Category</label>
                    <input
                      id="product-category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="Watches"
                      required
                    />
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
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="299"
                      required
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
                    />
                  </div>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="product-image">Image URL</label>
                  <input
                    id="product-image"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
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
                  />
                </div>

                <button className="admin-form-submit" type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Product
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
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
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
                          className={`admin-order-btn ${order.status === "Shipped" ? "admin-order-btn--disabled" : ""}`}
                          type="button"
                          onClick={() => markOrderShipped(order.id)}
                          disabled={order.status === "Shipped"}
                        >
                          {order.status === "Shipped" ? "Shipped" : "Mark as Shipped"}
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
              {products.map((product) => (
                <div className="admin-inventory-item" key={product.id}>
                  <img src={product.image} alt={product.name} className="admin-inventory-image" />
                  <div className="admin-inventory-content">
                    <input
                      className="admin-inventory-name"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    />
                    <textarea
                      className="admin-inventory-desc"
                      rows={2}
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                    />
                    <div className="admin-inventory-fields">
                      <div className="admin-inventory-field">
                        <label>Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                        />
                      </div>
                      <div className="admin-inventory-field">
                        <label>Stock</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={product.stock}
                          onChange={(e) => updateProduct(product.id, { stock: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-inventory-delete"
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    aria-label="Delete product"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashBoard;
