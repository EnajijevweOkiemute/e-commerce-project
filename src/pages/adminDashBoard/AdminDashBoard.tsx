import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import './adminDashBoard.css';

function AdminDashBoard() {
    const { currentUser, products, orders, createProduct, updateProduct, deleteProduct, markOrderShipped } = useAppContext();
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
        [orders],
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
        <section className="section">
            <div className="container dashboard-stack">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Admin dashboard</span>
                        <h2>Store control center</h2>
                        <p className="muted">Manage inventory, track order activity, and mark shipments as completed.</p>
                    </div>
                    <Link className="button button--dark" to="/shop">
                        View storefront
                    </Link>
                </div>

                <div className="dashboard-metrics admin-metrics">
                    <article className="panel dashboard-stat">
                        <span className="muted">Products</span>
                        <strong>{products.length}</strong>
                    </article>
                    <article className="panel dashboard-stat">
                        <span className="muted">Orders</span>
                        <strong>{orders.length}</strong>
                    </article>
                    <article className="panel dashboard-stat">
                        <span className="muted">Revenue</span>
                        <strong>${totalRevenue.toFixed(0)}</strong>
                    </article>
                </div>

                <div className="admin-dashboard-grid">
                    <article className="panel">
                        <div className="dashboard-card__head">
                            <div>
                                <span className="eyebrow">Inventory control</span>
                                <h3>Add new product</h3>
                            </div>
                        </div>
                        <form className="form-grid" onSubmit={handleSubmit}>
                            <label>
                                Product name
                                <input
                                    value={productForm.name}
                                    onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Category
                                <input
                                    value={productForm.category}
                                    onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productForm.price}
                                    onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Stock
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={productForm.stock}
                                    onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                                    required
                                />
                            </label>
                            <label className="form-grid__full">
                                Image URL
                                <input
                                    value={productForm.image}
                                    onChange={(event) => setProductForm({ ...productForm, image: event.target.value })}
                                    required
                                />
                            </label>
                            <label className="form-grid__full">
                                Description
                                <textarea
                                    rows={4}
                                    value={productForm.description}
                                    onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                                    required
                                />
                            </label>
                            <div className="form-grid__full form-actions">
                                <button className="button button--dark" type="submit">
                                    Add product
                                </button>
                            </div>
                        </form>
                    </article>

                    <article className="panel">
                        <div className="dashboard-card__head">
                            <div>
                                <span className="eyebrow">Order management</span>
                                <h3>Recent customer orders</h3>
                            </div>
                        </div>
                        {orders.length ? (
                            <div className="admin-order-list">
                                {orders.map((order) => (
                                    <article className="admin-order-card" key={order.id}>
                                        <div className="admin-order-card__head">
                                            <div>
                                                <strong>{order.id}</strong>
                                                <p className="muted">
                                                    {order.customer.name} • {order.customer.email}
                                                </p>
                                            </div>
                                            <span className="pill">{order.status}</span>
                                        </div>
                                        <p className="muted">
                                            {new Date(order.createdAt).toLocaleString()} • {order.items.length} item(s)
                                        </p>
                                        <div className="admin-order-card__items">
                                            {order.items.map((item) => (
                                                <div key={`${order.id}-${item.id}`}>
                                                    <span>{item.name}</span>
                                                    <strong>{item.quantity} × ${item.price}</strong>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="admin-order-card__foot">
                                            <strong>${order.total.toFixed(0)}</strong>
                                            <button
                                                className="button button--dark"
                                                type="button"
                                                onClick={() => markOrderShipped(order.id)}
                                                disabled={order.status === "Shipped"}
                                            >
                                                {order.status === "Shipped" ? "Shipped" : "Mark as shipped"}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="muted">Orders will appear here after customers complete checkout.</p>
                        )}
                    </article>
                </div>

                <article className="panel">
                    <div className="dashboard-card__head">
                        <div>
                            <span className="eyebrow">Inventory</span>
                            <h3>Manage existing products</h3>
                        </div>
                    </div>
                    <div className="inventory-list">
                        {products.map((product) => (
                            <article className="inventory-card" key={product.id}>
                                <img src={product.image} alt={product.name} className="inventory-card__image" />
                                <div className="inventory-card__content">
                                    <input
                                        value={product.name}
                                        onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                                    />
                                    <textarea
                                        rows={3}
                                        value={product.description}
                                        onChange={(event) => updateProduct(product.id, { description: event.target.value })}
                                    />
                                    <div className="inventory-card__fields">
                                        <label>
                                            Price
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={product.price}
                                                onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })}
                                            />
                                        </label>
                                        <label>
                                            Stock
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={product.stock}
                                                onChange={(event) => updateProduct(product.id, { stock: Number(event.target.value) })}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <button
                                    className="button button--light"
                                    type="button"
                                    onClick={() => deleteProduct(product.id)}
                                >
                                    Delete
                                </button>
                            </article>
                        ))}
                    </div>
                </article>
            </div>
        </section>
    );
}

export default AdminDashBoard;
