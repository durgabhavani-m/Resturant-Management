import {
  IndianRupee,
  Search,
  MoreHorizontal,
  Eye,
  CreditCard,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useBilling } from "../context/BillingContext";
import { useOrder } from "../context/OrderContext";
import { useRestaurant } from "../context/ResturantContext";
import type { Bill, PaymentMethod, PaymentStatus } from "../types/billing";

const BillingPage = () => {
  const { bills, deleteBill, updatePaymentStatus } = useBilling();
  const { orders, updateOrder } = useOrder();
  const { settings } = useRestaurant();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "All">("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  const filteredBills = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billNumber.toLowerCase().includes(normalizedSearch) ||
        bill.orderNumber.toLowerCase().includes(normalizedSearch) ||
        bill.customerName.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        status === "All" || bill.paymentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, status]);

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  );

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending"
  );

  const totalCollected = paidBills.reduce(
    (total, bill) => total + bill.total,
    0
  );

  const pendingAmount = pendingBills.reduce(
    (total, bill) => total + bill.total,
    0
  );

  const handlePayBill = () => {
    if (!payingBill || !paymentMethod || payingBill.paymentStatus !== "Pending") {
      return;
    }

    updatePaymentStatus(payingBill.id, "Paid", paymentMethod);
    const order = orders.find((item) => item.id === payingBill.orderId);
    if (order) {
      updateOrder({ ...order, paymentStatus: "Paid" });
    }
    setPayingBill(null);
    setPaymentMethod("");
  };

  const handleDeleteBill = () => {
    if (!deletingBill) return;
    deleteBill(deletingBill.id);
    setDeletingBill(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Billing
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage restaurant bills and payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Bills
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalBills}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Paid Bills
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {paidBills.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Collected
          </p>

          <p className="mt-2 flex items-center text-2xl font-bold text-slate-900">
            <IndianRupee size={20} />
            {totalCollected.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Pending Amount
          </p>

          <p className="mt-2 flex items-center text-2xl font-bold text-orange-600">
            <IndianRupee size={20} />
            {pendingAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Billing Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Filters */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search bill, order or customer..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as PaymentStatus | "All")
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
          >
            <option value="All">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Method
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No bills found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {bill.billNumber}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {bill.orderNumber}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {bill.customerName}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      ₹{bill.total.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          bill.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : bill.paymentStatus === "Pending"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {bill.paymentMethod ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === bill.id ? null : bill.id)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Actions for ${bill.billNumber}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenuId === bill.id && (
                          <div className="absolute right-0 z-30 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingBill(bill);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye size={16} />
                              View Bill
                            </button>
                            {bill.paymentStatus === "Pending" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPayingBill(bill);
                                  setPaymentMethod("");
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <CreditCard size={16} />
                                Pay Bill
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingBill(bill);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete Bill
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingBill && (() => {
        const order = orders.find((item) => item.id === viewingBill.orderId);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setViewingBill(null)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {settings.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Payment receipt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingBill(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close bill"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-3 border-b border-slate-200 px-6 py-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Bill Number</span>
                  <span className="font-medium text-slate-900">{viewingBill.billNumber}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-medium text-slate-900">{viewingBill.orderNumber}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-900">{viewingBill.customerName}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium text-slate-900">
                    {new Date(viewingBill.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5">
                <h3 className="mb-4 font-semibold text-slate-900">Items</h3>
                {order ? (
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.menuItemId}-${index}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    The original order is no longer available.
                  </p>
                )}

                <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{viewingBill.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>₹{viewingBill.tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount</span>
                    <span>₹{viewingBill.discount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
                    <span>Total</span>
                    <span>₹{viewingBill.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Payment Status</span>
                  <span className="font-medium text-slate-900">{viewingBill.paymentStatus}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-medium text-slate-900">{viewingBill.paymentMethod ?? "—"}</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        );
      })()}

      {payingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setPayingBill(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">Pay Bill</h2>
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close payment dialog"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Bill Number</span>
                  <span className="font-medium text-slate-900">{payingBill.billNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-medium text-slate-900">{payingBill.orderNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-900">{payingBill.customerName}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                  <span className="font-medium text-slate-700">Total Amount</span>
                  <span className="font-bold text-slate-900">
                    ₹{payingBill.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="payment-method" className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod | "")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayBill}
                disabled={!paymentMethod}
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setDeletingBill(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Delete Bill</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Delete {deletingBill.billNumber}? The order will not be affected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingBill(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close delete confirmation"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeletingBill(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBill}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;