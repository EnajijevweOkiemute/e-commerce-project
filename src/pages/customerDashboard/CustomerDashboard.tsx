import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./customerDashboard.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CustomerDashboard() {
  const { currentUser, orders, cartCount } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "customer") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const myOrders = orders.filter((order) => order?.userId === currentUser?.id);
  const recentOrder = myOrders[0];
  const totalSpent = myOrders?.reduce((sum, order) => sum + order?.total, 0);

  return (
    <section className="dashboard-section">
      <div className="container">

        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <span className="dashboard-eyebrow">Customer Dashboard</span>
            <h1 className="dashboard-title">
              Welcome back, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="dashboard-subtitle">
              Track orders, review activity, and manage your shopping experience.
            </p>
          </div>
          <Link className="dashboard-cta" to="/shop">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-icon metric-icon--orders">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Orders</span>
              <strong className="metric-value">{myOrders.length}</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon metric-icon--spent">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-label">Total Spent</span>
              <strong className="metric-value">{currency.format(totalSpent)}</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon metric-icon--cart">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-label">Items in Cart</span>
              <strong className="metric-value">{cartCount}</strong>
            </div>
          </div>
        </div>
        <div className="dashboard-grid">
       
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <span className="card-eyebrow">Account</span>
                <h3 className="card-title">Profile Details</h3>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <strong className="detail-value">{currentUser.name}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <strong className="detail-value">{currentUser.email}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Type</span>
                  <strong className="detail-value">Customer</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <span className="card-eyebrow">Latest Order</span>
                <h3 className="card-title">
                  {recentOrder ? recentOrder.id : "No orders yet"}
                </h3>
              </div>
              {recentOrder && (
                <span
                  className={`status-badge status-badge--${recentOrder.status.toLowerCase()}`}
                >
                  {recentOrder.status}
                </span>
              )}
            </div>
            <div className="dashboard-card-body">
              {recentOrder ? (
                <>
                  <p className="card-description">
                    Placed on{" "}
                    {new Date(recentOrder.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    for {currency.format(recentOrder.total)}
                  </p>
                  <Link className="card-link" to="/orders">
                    View all orders
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </>
              ) : (
                <p className="card-description">
                  Your first order will appear here after checkout.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="dashboard-card dashboard-card--full">
          <div className="dashboard-card-header">
            <div>
              <span className="card-eyebrow">Purchase History</span>
              <h3 className="card-title">Recent Orders</h3>
            </div>
            {myOrders.length > 0 && (
              <Link className="card-link" to="/orders">
                View all
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            )}
          </div>

          <div className="dashboard-card-body">
            {myOrders.length ? (
              <div className="orders-table">
                <div className="orders-table-header">
                  <span>Order ID</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>
                {myOrders.slice(0, 5).map((order) => (
                  <div className="orders-table-row" key={order.id}>
                    <span className="order-id">{order.id}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`status-badge status-badge--${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                    <strong className="order-total">
                      {currency.format(order.total)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <p>No purchases yet. Browse the shop to get started.</p>
                <Link to="/shop" className="empty-state-cta">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}