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

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Orders</span>
            <h2>{currentUser ? "Your recent purchases" : "Sign in to view orders"}</h2>
          </div>
        </div>
        {!currentUser ? (
          <div className="panel empty-state">
            <button className="button button--dark" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        ) : myOrders.length ? (
          <div className="order-list">
            {myOrders.map((order) => (
              <article className="panel order-card" key={order.id}>
                <div className="order-card__top">
                  <div>
                    <strong>{order.id}</strong>
                    <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="pill">{order.status}</span>
                </div>
                <div className="order-card__items">
                  {order.items.map((item) => (
                    <div className="order-card__item" key={`${order.id}-${item.id}`}>
                      <span>{item.name}</span>
                      <strong>
                        {item.quantity} × {currency.format(item.price)}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="summary-row">
                  <span>Total</span>
                  <strong>{currency.format(order.total)}</strong>
                </div>
                {order.paymentReference ? (
                  <div className="summary-row">
                    <span>Payment Ref</span>
                    <strong>{order.paymentReference}</strong>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <h3>No orders yet</h3>
            <button className="button button--dark" onClick={() => navigate("/shop")}>
              Browse products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
