import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./checkout.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Checkout() {
  const { cart, cartTotal, currentUser, orders, setOrders, clearCart } = useAppContext();
  const navigate = useNavigate();

  const [checkoutState, setCheckoutState] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    address: "",
    city: "",
    country: "",
    card: "",
  });

  const handlePlaceOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || cart.length === 0) return;

    const nextOrders = [
      {
        id: `ORD-${Date.now()}`,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        total: cartTotal,
        status: "Processing",
        items: cart,
        customer: checkoutState,
      },
      ...orders,
    ];

    setOrders(nextOrders);
    clearCart();
    navigate("/orders");
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
          <label className="form-grid__full">
            Card number
            <input
              value={checkoutState.card}
              onChange={(event) =>
                setCheckoutState({ ...checkoutState, card: event.target.value })
              }
              placeholder="4242 4242 4242 4242"
              required
            />
          </label>
          <div className="form-grid__full form-actions">
            <strong>Total: {currency.format(cartTotal)}</strong>
            <button className="button button--dark" type="submit">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
