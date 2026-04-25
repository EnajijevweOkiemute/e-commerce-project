import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { loadPaystackScript, getPaystackPublicKey } from "../../utils/paystack";
import "./checkout.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Checkout() {
  const { cart, cartTotal, currentUser, orders, setOrders, clearCart, addNotification } = useAppContext();
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const [checkoutState, setCheckoutState] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    address: "",
    city: "",
    country: "",
  });

  const subtotal = cartTotal;
  const shipping = cart.length > 0 ? 15 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Preload Paystack script when component mounts
  useEffect(() => {
    loadPaystackScript()
      .then(() => {
        setIsPaystackReady(true);
      })
      .catch((error) => {
        console.error("Failed to load Paystack:", error);
        setPaymentError("Failed to load payment system. Please refresh the page.");
      });
  }, []);

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || cart.length === 0) return;

    const publicKey = getPaystackPublicKey();
    if (!publicKey) {
      setPaymentError("Missing Paystack public key. Set VITE_PAYSTACK_PUBLIC_KEY in your environment.");
      return;
    }

    if (!isPaystackReady) {
      setPaymentError("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    try {
      setIsPaying(true);
      setPaymentError("");

      const PaystackPop = await loadPaystackScript();
      if (!PaystackPop) {
        setPaymentError("Unable to start Paystack checkout.");
        setIsPaying(false);
        return;
      }

      const orderId = `ORD-${Date.now()}`;
      const reference = `PAY-${Date.now()}`;

      PaystackPop.setup({
        key: publicKey,
        email: checkoutState.email,
        amount: Math.round(total * 100),
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId,
            },
          ],
        },
        callback: (response) => {
          const nextOrders = [
            {
              id: orderId,
              userId: currentUser.id,
              createdAt: new Date().toISOString(),
              total: total,
              status: "Processing",
              paymentStatus: "Paid" as const,
              paymentReference: response.reference,
              items: cart,
              customer: checkoutState,
            },
            ...orders,
          ];
          setOrders(nextOrders);

          addNotification({
            userId: currentUser.id,
            title: "Payment successful",
            message: `Your payment for ${orderId} was received. Reference: ${response.reference}.`,
            type: "payment",
          });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Kyklos payment successful", {
              body: `Your order ${orderId} has been confirmed.`,
            });
          } else if ("Notification" in window && Notification.permission === "default") {
            void Notification.requestPermission();
          }

          clearCart();
          setIsPaying(false);
          navigate("/orders");
        },
        onClose: () => {
          setIsPaying(false);
        },
      }).openIframe();
    } catch (error) {
      setIsPaying(false);
      setPaymentError(
        error instanceof Error ? error.message : "Unable to initialize payment.",
      );
    }
  };

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back-btn" onClick={() => navigate("/cart")}>
            ← Back to Cart
          </button>
          <div className="checkout-header-content">
            <h1 className="checkout-title">Complete Your Order</h1>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-wrapper">
            <form className="checkout-form" onSubmit={handlePlaceOrder}>
              <div className="checkout-form-section">
                <h2 className="checkout-form-heading">Contact Information</h2>
                <div className="checkout-form-grid">
                  <label className="checkout-label">
                    Full Name
                    <input
                      className="checkout-input"
                      value={checkoutState.name}
                      onChange={(event) =>
                        setCheckoutState({ ...checkoutState, name: event.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="checkout-label">
                    Email Address
                    <input
                      className="checkout-input"
                      type="email"
                      value={checkoutState.email}
                      onChange={(event) =>
                        setCheckoutState({ ...checkoutState, email: event.target.value })
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="checkout-form-section">
                <h2 className="checkout-form-heading">Shipping Address</h2>
                <div className="checkout-form-grid">
                  <label className="checkout-label checkout-label-full">
                    Street Address
                    <input
                      className="checkout-input"
                      value={checkoutState.address}
                      onChange={(event) =>
                        setCheckoutState({ ...checkoutState, address: event.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="checkout-label">
                    City
                    <input
                      className="checkout-input"
                      value={checkoutState.city}
                      onChange={(event) =>
                        setCheckoutState({ ...checkoutState, city: event.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="checkout-label">
                    Country
                    <input
                      className="checkout-input"
                      value={checkoutState.country}
                      onChange={(event) =>
                        setCheckoutState({ ...checkoutState, country: event.target.value })
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="checkout-payment-info">
                <div className="checkout-payment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="checkout-payment-title">Secure Payment via Paystack</h3>
                  <p className="checkout-payment-desc">
                    You'll be redirected to complete your payment securely through Paystack.
                  </p>
                </div>
              </div>

              {paymentError && (
                <div className="checkout-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {paymentError}
                </div>
              )}

              <button 
                className="checkout-submit-btn" 
                type="submit" 
                disabled={isPaying || cart.length === 0 || !isPaystackReady}
              >
                {!isPaystackReady ? (
                  <>
                    <span className="checkout-spinner"></span>
                    Loading payment system...
                  </>
                ) : isPaying ? (
                  <>
                    <span className="checkout-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pay {currency.format(total)}
                  </>
                )}
              </button>
            </form>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary-sticky">
              <h2 className="checkout-summary-title">Order Summary</h2>

              <div className="checkout-items">
                {cart.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <img src={item.image} alt={item.name} className="checkout-item-image" />
                    <div className="checkout-item-details">
                      <h3 className="checkout-item-name">{item.name}</h3>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="checkout-item-price">
                      {currency.format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-divider"></div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>{currency.format(subtotal)}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? currency.format(shipping) : "Free"}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Tax (8%)</span>
                  <span>{currency.format(tax)}</span>
                </div>
                <div className="checkout-divider"></div>
                <div className="checkout-total-row checkout-total-final">
                  <span>Total</span>
                  <span>{currency.format(total)}</span>
                </div>
              </div>

              <div className="checkout-security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Secure  checkout
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
