import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./orders.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Orders() {
  const { orders, currentUser } = useAppContext();
  const navigate = useNavigate();

  const myOrders = currentUser
    ? orders.filter((order) => order.userId === currentUser.id)
    : [];

  const totalSpent = myOrders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = myOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const getStatusClass = (status: string) => {
    return `orders-status-badge status-${status.toLowerCase()}`;
  };

  return (
    <section className="orders-section">
      <div className="orders-container">
        <div className="orders-header">
          <button className="orders-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          
          <div className="orders-header-content">
            <div className="orders-header-text">
              <div className="orders-eyebrow">Order History</div>
              <h1 className="orders-title">
                {currentUser ? "Your Orders" : "Sign in to view orders"}
              </h1>
              {currentUser && myOrders.length > 0 && (
                <p className="orders-subtitle">
                  Track and manage all your purchases in one place
                </p>
              )}
            </div>

            {currentUser && myOrders.length > 0 && (
              <div className="orders-stats">
                <div className="orders-stat">
                  <span className="orders-stat-label">Total Orders</span>
                  <span className="orders-stat-value">{myOrders.length}</span>
                </div>
                <div className="orders-stat">
                  <span className="orders-stat-label">Items Purchased</span>
                  <span className="orders-stat-value">{totalItems}</span>
                </div>
                <div className="orders-stat">
                  <span className="orders-stat-label">Total Spent</span>
                  <span className="orders-stat-value">{currency.format(totalSpent)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!currentUser ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="orders-empty-title">Sign in to view your orders</h2>
            <p className="orders-empty-text">
              Log in to access your order history and track your purchases
            </p>
            <button className="orders-empty-btn" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        ) : myOrders.length > 0 ? (
          <div className="orders-list">
            {myOrders.map((order) => (
              <article className="orders-card" key={order.id}>
                <div className="orders-card-header">
                  <div className="orders-card-info">
                    <h3 className="orders-card-id">Order {order.id}</h3>
                    <p className="orders-card-date">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={getStatusClass(order.status)}>{order.status}</span>
                </div>

                <div className="orders-items">
                  {order.items.map((item) => (
                    <div className="orders-item" key={`${order.id}-${item.id}`}>
                      <img src={item.image} alt={item.name} className="orders-item-image" />
                      <div className="orders-item-details">
                        <h4 className="orders-item-name">{item.name}</h4>
                        <p className="orders-item-qty">Quantity: {item.quantity}</p>
                      </div>
                      <span className="orders-item-price">
                        {currency.format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="orders-card-footer">
                  <div className="orders-summary-row">
                    <span className="orders-summary-label">Subtotal</span>
                    <span className="orders-summary-value">{currency.format(order.total)}</span>
                  </div>
                  <div className="orders-summary-row total">
                    <span>Order Total</span>
                    <span>{currency.format(order.total)}</span>
                  </div>

                  {order.paymentReference && (
                    <div className="orders-payment-ref">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="orders-payment-ref-label">Payment Reference:</span>
                      <span className="orders-payment-ref-value">{order.paymentReference}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h2 className="orders-empty-title">No orders yet</h2>
            <p className="orders-empty-text">
              Start shopping to see your orders here. Discover our curated collection of premium products.
            </p>
            <button className="orders-empty-btn" onClick={() => navigate("/shop")}>
              Browse Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
