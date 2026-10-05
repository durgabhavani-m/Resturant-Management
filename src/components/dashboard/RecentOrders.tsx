import {useOrder} from "../../context/OrderContext";

const RecentOrders = () => {
  const {orders} = useOrder();
  const recentOrders = orders.slice(-4).reverse();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            Recent Orders
          </h3>

          <p className="text-sm text-slate-500">
            Latest restaurant orders
          </p>
        </div>

        <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
          View all
        </button>
      </div>

      <div className="mt-5 space-y-4">

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {order.orderNumber}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {order.customerName}
              </p>
            </div>

            <div className="text-right">

              <p className="text-sm font-semibold text-slate-800">
                ₹{order.total.toLocaleString("en-IN")}
              </p>

              <span
                className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  order.status === "Completed"
                    ? "bg-green-50 text-green-600"
                    : order.status === "Preparing"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-yellow-50 text-yellow-600"
                }`}
              >
                {order.status}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default RecentOrders;