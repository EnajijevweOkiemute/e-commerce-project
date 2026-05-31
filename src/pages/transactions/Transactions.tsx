import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { CartItem, CheckoutCustomer, Transaction } from "../../types";
import { apiFetchMyOrders, ApiOrder } from "../../utils/orderApi";
import "./transactions.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function apiOrderToTransaction(order: ApiOrder, userId: string): Transaction {
  return {
    id: `API-${order.id}`,
    orderId: order.id,
    userId,
    createdAt: order.createdAt,
    total: order.total,
    status: "Successful",
    paymentReference: `API-${order.id}`,
    items: order.items.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.imageUrl ?? "",
    })),
    customer: {
      name: "",
      email: "",
      address: order.shippingAddress,
      city: "",
      country: "",
    },
  };
}

function receiptText(transaction: Transaction) {
  const itemLines = transaction.items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} - ${currency.format(item.price * item.quantity)}`,
    )
    .join("\n");

  return [
    "KYKLOS TRANSACTION RECEIPT",
    `Transaction: ${transaction.id}`,
    `Order: ${transaction.orderId}`,
    `Status: ${transaction.status}`,
    `Reference: ${transaction.paymentReference}`,
    `Date: ${new Date(transaction.createdAt).toLocaleString()}`,
    `Customer: ${transaction.customer.name || "Not provided"}`,
    `Email: ${transaction.customer.email || "Not provided"}`,
    `Address: ${[transaction.customer.address, transaction.customer.city, transaction.customer.country].filter(Boolean).join(", ") || "Not provided"}`,
    "",
    "Items",
    itemLines || "No items recorded",
    "",
    `Total: ${currency.format(transaction.total)}`,
    transaction.failureReason ? `Failure reason: ${transaction.failureReason}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function downloadReceipt(transaction: Transaction) {
  const blob = new Blob([receiptText(transaction)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kyklos-${transaction.id}-receipt.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function transactionItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function Transactions() {
  const { currentUser, transactions, replaceCart } = useAppContext();
  const navigate = useNavigate();
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "customer") return;
    setLoading(true);
    apiFetchMyOrders()
      .then(setApiOrders)
      .catch(() => setApiOrders([]))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const visibleTransactions = useMemo(() => {
    if (!currentUser) return [];

    const locallyVisible =
      currentUser.role === "admin"
        ? transactions
        : transactions.filter((transaction) => transaction.userId === currentUser.id);

    const localOrderIds = new Set(locallyVisible.map((transaction) => transaction.orderId));
    const apiTransactions =
      currentUser.role === "customer"
        ? apiOrders
            .filter((order) => !localOrderIds.has(order.id))
            .map((order) => apiOrderToTransaction(order, currentUser.id))
        : [];

    return [...locallyVisible, ...apiTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [apiOrders, currentUser, transactions]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const successfulCount = visibleTransactions.filter((item) => item.status === "Successful").length;
  const failedCount = visibleTransactions.filter((item) => item.status === "Failed").length;
  const successfulTotal = visibleTransactions
    .filter((item) => item.status === "Successful")
    .reduce((sum, item) => sum + item.total, 0);

  const handleRepeatTransaction = async (transaction: Transaction) => {
    await replaceCart(transaction.items);
    navigate("/checkout", {
      state: {
        repeatTransaction: {
          orderId: transaction.orderId,
          customer: transaction.customer as CheckoutCustomer,
        },
      },
    });
  };

  return (
    <section className="transactions-section">
      <div className="transactions-container">
        <div className="transactions-header">
          <button
            className="transactions-back-btn"
            onClick={() =>
              navigate(currentUser.role === "admin" ? "/admin-dashboard" : "/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="transactions-header-content">
            <div>
              <span className="transactions-eyebrow">Transaction History</span>
              <h1 className="transactions-title">Payment Activity</h1>
              <p className="transactions-subtitle">
                View successful and failed payment attempts, receipts, and repeat eligible transactions.
              </p>
            </div>

            <div className="transactions-stats">
              <div className="transactions-stat">
                <span>Total</span>
                <strong>{visibleTransactions.length}</strong>
              </div>
              <div className="transactions-stat">
                <span>Successful</span>
                <strong>{successfulCount}</strong>
              </div>
              <div className="transactions-stat">
                <span>Failed</span>
                <strong>{failedCount}</strong>
              </div>
              <div className="transactions-stat">
                <span>Paid</span>
                <strong>{currency.format(successfulTotal)}</strong>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="transactions-empty">
            <span className="transactions-spinner" />
            <p>Loading transactions...</p>
          </div>
        ) : visibleTransactions.length ? (
          <div className="transactions-panel">
            <div className="transactions-table transactions-table--head">
              <span>Transaction</span>
              <span>Date</span>
              <span>Status</span>
              <span>Items</span>
              <span>Total</span>
              <span>Actions</span>
            </div>

            {visibleTransactions?.map((transaction) => (
              <button
                className="transactions-table transactions-row"
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                type="button"
              >
                <span className="transactions-reference">
                  <strong>{transaction.paymentReference}</strong>
                  <small>Order {transaction.orderId}</small>
                </span>
                <span>
                  {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className={`transactions-status transactions-status--${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </span>
                <span>{transactionItemCount(transaction.items)}</span>
                <strong>{currency.format(transaction.total)}</strong>
                <span className="transactions-actions">
                  <button
                    type="button"
                    className="transactions-action-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      downloadReceipt(transaction);
                    }}
                  >
                    Download
                  </button>
                  {currentUser?.role === "customer" && (
                    <button
                      type="button"
                      className="transactions-action-btn transactions-action-btn--dark"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleRepeatTransaction(transaction);
                      }}
                    >
                      Repeat
                    </button>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="transactions-empty">
            <h2>No transactions yet</h2>
            <p>Successful and failed payment attempts will appear here after checkout.</p>
            {currentUser?.role === "customer" && (
              <button type="button" onClick={() => navigate("/shop")}>
                Browse Products
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div className="transactions-modal-backdrop" role="presentation" onClick={() => setSelectedTransaction(null)}>
          <div
            className="transactions-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="transactions-modal-header">
              <div>
                <span className="transactions-eyebrow">Transaction Details</span>
                <h2 id="transaction-detail-title">{selectedTransaction.paymentReference}</h2>
              </div>
              <button type="button" className="transactions-close-btn" onClick={() => setSelectedTransaction(null)}>
                ×
              </button>
            </div>

            <div className="transactions-detail-grid">
              <div>
                <span>Status</span>
                <strong className={`transactions-status transactions-status--${selectedTransaction.status.toLowerCase()}`}>
                  {selectedTransaction.status}
                </strong>
              </div>
              <div>
                <span>Order</span>
                <strong>{selectedTransaction.orderId}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{new Date(selectedTransaction.createdAt).toLocaleString()}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{currency.format(selectedTransaction.total)}</strong>
              </div>
            </div>

            {selectedTransaction?.failureReason && (
              <div className="transactions-failure-reason">
                {selectedTransaction.failureReason}
              </div>
            )}

            <div className="transactions-customer">
              <h3>Customer</h3>
              <p>{selectedTransaction?.customer.name || "Not provided"}</p>
              <p>{selectedTransaction?.customer.email || "Not provided"}</p>
              <p>
                {[selectedTransaction?.customer.address, selectedTransaction?.customer.city, selectedTransaction?.customer.country]
                  .filter(Boolean)
                  .join(", ") || "No address recorded"}
              </p>
            </div>

            <div className="transactions-items">
              <h3>Items</h3>
              {selectedTransaction.items.map((item) => (
                <div className="transactions-item" key={`${selectedTransaction.id}-${item.id}`}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>Qty {item.quantity}</span>
                  </div>
                  <b>{currency.format(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="transactions-modal-actions">
              <button type="button" onClick={() => downloadReceipt(selectedTransaction)}>
                Download Receipt
              </button>
              {currentUser?.role === "customer" && (
                <button
                  type="button"
                  className="transactions-primary-btn"
                  onClick={() => void handleRepeatTransaction(selectedTransaction)}
                >
                  Repeat Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
