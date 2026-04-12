import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./cart.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Cart() {
  const { cart, updateCartQuantity, removeFromCart, cartCount, cartTotal, currentUser } = useAppContext();
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="container cart-layout">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Bag</span>
              <h2>Your shopping cart</h2>
            </div>
          </div>
          {cart.length ? (
            <div className="cart-list">
              {cart.map((item) => (
                <article className="panel cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item__content">
                    <h3>{item.name}</h3>
                    <p className="muted">{currency.format(item.price)}</p>
                    <div className="cart-item__controls">
                      <button onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                      <button className="text-button" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <h3>Your cart is empty</h3>
              <button className="button button--dark" onClick={() => navigate("/shop")}>
                Start shopping
              </button>
            </div>
          )}
        </div>

        <aside className="panel summary-card">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cartCount}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>{currency.format(cartTotal)}</strong>
          </div>
          <button
            className="button button--dark button--wide"
            disabled={!cart.length}
            onClick={() => navigate(currentUser ? "/checkout" : "/login")}
          >
            {currentUser ? "Proceed to Checkout" : "Login to Checkout"}
          </button>
        </aside>
      </div>
    </section>
  );
}
