import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./cart.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Cart() {
  const { cart, updateCartQuantity, removeFromCart, cartCount, cartTotal, currentUser } =
    useAppContext();
  const navigate = useNavigate();

  return (
    <section className="cart-section">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <span className="cart-eyebrow">Shopping Cart</span>
            <h1 className="cart-title">{cartCount  <= 1 ? `Your Item` : `Your Items`}</h1>
            <p className="cart-subtitle">
              {cart.length > 0
                ? `${cartCount} ${cartCount === 1 ? "item" : "items"} in your cart`
                : "Your cart is currently empty"}
            </p>
          </div>
        </div>

        {cart.length > 0 ? (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-main">
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-price">{currency.format(item.price)}</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-item-quantity">
                          <button
                            className="quantity-btn"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      <strong>{currency.format(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <aside className="cart-sidebar">
              <div className="cart-summary">
                <h3 className="cart-summary-title">Order Summary</h3>
                
                <div className="cart-summary-details">
                  <div className="cart-summary-row">
                    <span>Subtotal ({cartCount} items)</span>
                    <strong>{currency.format(cartTotal)}</strong>
                  </div>
                  <div className="cart-summary-row">
                    <span>Shipping</span>
                    <strong>Free</strong>
                  </div>
                  <div className="cart-summary-row">
                    <span>Tax</span>
                    <strong>Calculated at checkout</strong>
                  </div>
                </div>

                <div className="cart-summary-total">
                  <span>Total</span>
                  <strong>{currency.format(cartTotal)}</strong>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={() => navigate(currentUser ? "/checkout" : "/login")}
                >
                  {currentUser ? "Proceed to Checkout" : "Login to Checkout"}
                </button>

                <button
                  className="cart-continue-btn"
                  onClick={() => navigate("/shop")}
                >
                  Continue Shopping
                </button>

                <div className="cart-benefits">
                  <div className="cart-benefit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="cart-benefit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>Free shipping over $500</span>
                  </div>
                  <div className="cart-benefit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    <span>30-day returns</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-text">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <button className="cart-empty-btn" onClick={() => navigate("/shop")}>
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
