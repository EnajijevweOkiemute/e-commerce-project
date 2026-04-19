import { useState } from "react";
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

  const [checkoutState, setCheckoutState] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    address: "",
    city: "",
    country: "",
  });

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || cart.length === 0) return;

    const publicKey = getPaystackPublicKey();
    if (!publicKey) {
      setPaymentError("Missing Paystack public key. Set VITE_PAYSTACK_PUBLIC_KEY in your environment.");
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
        amount: Math.round(cartTotal * 100),
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
              total: cartTotal,
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
    <section className="section">
      <div className="container form-page">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Checkout</span>
            <h2>Complete your order</h2>
          </div>
        </div>
        <form className="panel form-grid" onSubmit={handlePlaceOrder}>
          <label>
            Full name
            <input
              value={checkoutState.name}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, name: event.target.value })
              }
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={checkoutState.email}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, email: event.target.value })
              }
              required
            />
          </label>
          <label className="form-grid__full">
            Address
            <input
              value={checkoutState.address}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, address: event.target.value })
              }
              required
            />
          </label>
          <label>
            City
            <input
              value={checkoutState.city}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, city: event.target.value })
              }
              required
            />
          </label>
          <label>
            Country
            <input
              value={checkoutState.country}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, country: event.target.value })
              }
              required
            />
          </label>
          <div className="panel checkout-paystack-note form-grid__full">
            <span className="eyebrow">Payment gateway</span>
            <h3>Paystack</h3>
            <p className="muted">
              You will be redirected to the Paystack secure popup to complete payment.
            </p>
          </div>
          {paymentError ? <p className="form-error form-grid__full">{paymentError}</p> : null}
          <div className="form-grid__full form-actions">
            <strong>Total: {currency.format(cartTotal)}</strong>
            <button className="button button--dark" type="submit" disabled={isPaying}>
              {isPaying ? "Opening Paystack..." : "Pay with Paystack"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
