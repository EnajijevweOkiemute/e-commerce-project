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

function generateReceiptHTML(transaction: Transaction) {
  const itemsHtml = transaction.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />`
              : ""
          }
          <span style="font-weight: 500; color: #333;">${item.name}</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #555;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #555;">${currency.format(
        item.price,
      )}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #333;">${currency.format(
        item.price * item.quantity,
      )}</td>
    </tr>
  `,
    )
    .join("");

  const date = new Date(transaction.createdAt).toLocaleString();
  const address =
    [transaction.customer.address, transaction.customer.city, transaction.customer.country]
      .filter(Boolean)
      .join(", ") || "Not provided";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt - ${transaction.id}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
          background-color: #f9fafb;
          color: #111827;
        }
        .receipt-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .receipt-header {
          background-color: #111827;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .receipt-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .receipt-header p {
          margin: 8px 0 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .receipt-body {
          padding: 30px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-block h3 {
          margin: 0 0 8px;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.5px;
        }
        .info-block p {
          margin: 0;
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        .status-successful { background-color: #d1fae5; color: #065f46; }
        .status-failed { background-color: #fee2e2; color: #991b1b; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        th.center { text-align: center; }
        th.right { text-align: right; }
        
        .totals {
          margin-top: 30px;
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        .totals-table {
          width: 250px;
        }
        .totals-table td {
          padding: 8px 0;
          color: #4b5563;
        }
        .totals-table tr.grand-total td {
          color: #111827;
          font-weight: 700;
          font-size: 18px;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }
        .totals-table td:last-child {
          text-align: right;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .print-btn {
          display: block;
          margin: 20px auto 0;
          padding: 10px 20px;
          background-color: #111827;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .print-btn:hover { background-color: #374151; }
        @media print {
          body { background-color: white; padding: 0; }
          .receipt-container { box-shadow: none; max-width: 100%; border-radius: 0; }
          .print-btn { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>KYKLOS</h1>
          <p>Transaction Receipt</p>
        </div>
        
        <div class="receipt-body">
          <div class="info-grid">
            <div class="info-block">
              <h3>Transaction Details</h3>
              <p><strong>ID:</strong> ${transaction.id}</p>
              <p><strong>Order:</strong> ${transaction.orderId}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Reference:</strong> ${transaction.paymentReference}</p>
              <span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span>
              ${
                transaction.failureReason
                  ? `<p style="color: #ef4444; margin-top: 8px; font-size: 13px;">Reason: ${transaction.failureReason}</p>`
                  : ""
              }
            </div>
            
            <div class="info-block">
              <h3>Billed To</h3>
              <p><strong>${transaction.customer.name || "Customer"}</strong></p>
              <p>${transaction.customer.email || "No email"}</p>
              <p style="margin-top: 8px; color: #6b7280;">${address}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Price</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                itemsHtml ||
                '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #9ca3af;">No items recorded</td></tr>'
              }
            </tbody>
          </table>
          
          <div class="totals">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td>${currency.format(transaction.total)}</td>
              </tr>
              <tr class="grand-total">
                <td>Total</td>
                <td>${currency.format(transaction.total)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>If you have any questions concerning this receipt, contact our customer support.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
      
      <button class="print-btn" onclick="window.print()">Print Receipt</button>
    </body>
    </html>
  `;
}

function downloadReceipt(transaction: Transaction) {
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(generateReceiptHTML(transaction));
    newWindow.document.close();
  }
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
