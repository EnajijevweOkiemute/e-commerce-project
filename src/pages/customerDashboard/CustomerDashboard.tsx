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
    <section className="section">
      <div className="container dashboard-stack">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Customer dashboard</span>
            <h2 className="">{currentUser.name}</h2>
            <p className="muted">Track orders, review activity, and jump back into your shopping flow.</p>
          </div>
          <Link className="button button--dark" to="/shop">
            Continue shopping
          </Link>
        </div>

        <div className="dashboard-metrics">
          <article className="panel dashboard-stat">
            <span className="muted">Orders placed</span>
            <strong>{myOrders.length}</strong>
          </article>
          <article className="panel dashboard-stat">
            <span className="muted">Total spent</span>
            <strong>{currency.format(totalSpent)}</strong>
          </article>
          <article className="panel dashboard-stat">
            <span className="muted">Items in cart</span>
            <strong>{cartCount}</strong>
          </article>
        </div>

        <div className="dashboard-grid">
          <article className="panel">
            <div className="dashboard-card__head">
              <div>
                <span className="eyebrow">Account</span>
                <h3>Profile details</h3>
              </div>
            </div>
            <div className="dashboard-detail-list">
              <div>
                <span className="muted">Full name</span>
                <strong>{currentUser.name}</strong>
              </div>
              <div>
                <span className="muted">Email</span>
                <strong>{currentUser.email}</strong>
              </div>
              <div>
                <span className="muted">Role</span>
                <strong>Customer</strong>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="dashboard-card__head">
              <div>
                <span className="eyebrow">Latest order</span>
                <h3>{recentOrder ? recentOrder.id : "No orders yet"}</h3>
              </div>
              {recentOrder ? <span className="pill">{recentOrder.status}</span> : null}
            </div>
            {recentOrder ? (
              <>
                <p className="muted">
                  Placed on {new Date(recentOrder.createdAt).toLocaleString()} for{" "}
                  {currency.format(recentOrder.total)}.
                </p>
                <Link className="text-button" to="/orders">
                  View all orders
                </Link>
              </>
            ) : (
              <p className="muted">Your first order will appear here after checkout.</p>
            )}
          </article>
        </div>

        <article className="panel">
          <div className="dashboard-card__head">
            <div>
              <span className="eyebrow">Purchase history</span>
              <h3>Recent orders</h3>
            </div>
          </div>
          {myOrders.length ? (
            <div className="dashboard-table">
              <div className="dashboard-table__row dashboard-table__row--head">
                <span>Order</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {myOrders.slice(0, 5).map((order) => (
                <div className="dashboard-table__row" key={order.id}>
                  <span>{order.id}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>{order.status}</span>
                  <strong>{currency.format(order.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No purchases yet. Browse the shop to get started.</p>
          )}
        </article>
      </div>
    </section>
  );
}
