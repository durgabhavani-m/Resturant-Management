import {ShoppingCart, IndianRupee, Users, Armchair} from "lucide-react";
import {useState} from "react";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";

import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { useTable } from "../../context/TableContext";
import { useBilling } from "../../context/BillingContext";

type SalesRange = 7 | 30 ;

const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const Dashboard = () => {

    const {user} = useAuth();
    const {orders} =useOrder();
    const {tables} = useTable();
    const {bills} = useBilling();
    const [salesRange, setSalesRange] = useState<SalesRange>(7);

    const today = getDateKey(new Date());
    
    const todaysOrders = orders.filter(
        (order) => getDateKey(new Date(order.createdAt)) === today
    );

    const billedOrderIds = new Set(bills.map((bill) => bill.orderId));
    const salesRecords = [
        ...bills
            .filter((bill) => bill.paymentStatus === "Paid")
            .map((bill) => ({date: bill.paidAt ?? bill.createdAt, total: bill.total})),
        ...orders
            .filter((order) => order.paymentStatus === "Paid" && !billedOrderIds.has(order.id))
            .map((order) => ({date: order.createdAt, total: order.total})),
    ];

    const salesByDate = new Map<string, number>();
    salesRecords.forEach((record) => {
        const date = new Date(record.date);
        if (Number.isNaN(date.getTime())) return;
        const dateKey = getDateKey(date);
        salesByDate.set(dateKey, (salesByDate.get(dateKey) ?? 0) + record.total);
    });

    const todayRevenue = salesByDate.get(today) ?? 0;
    const currentPeriodStart = new Date();
    currentPeriodStart.setHours(0, 0, 0, 0);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - salesRange + 1);

    const salesPeriods = Array.from({length: salesRange}, (_, index) => {
        const date = new Date(currentPeriodStart);
        date.setDate(currentPeriodStart.getDate() + index);
        const previousDate = new Date(date);
        previousDate.setDate(previousDate.getDate() - salesRange);

        return {
            date,
            current: salesByDate.get(getDateKey(date)) ?? 0,
            previous: salesByDate.get(getDateKey(previousDate)) ?? 0,
        };
    });

    const currentPeriodTotal = salesPeriods.reduce((sum, day) => sum + day.current, 0);
    const previousPeriodTotal = salesPeriods.reduce((sum, day) => sum + day.previous, 0);
    const maxRevenue = Math.max(
        ...salesPeriods.flatMap((day) => [day.current, day.previous]),
        1
    );

    const formattedRevenue = `₹${todayRevenue.toLocaleString("en-IN")}`;

    const availableTables = tables.filter(
        (table) => table.status === "Available"
    ).length;

    const totaltables = tables.length;

    return (
        <div className="min-h-full space-y-6">

            <div className="mb-6">
                <p className="text-sm text-slate-500">
                    Welcome back, {user?.name}
                </p>

                <h1 className="mt-1 text-sm font-bold text-slate-900">
                   {user?.role} Dashboard 
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                
                <StatCard
                title="Today's Orders"
                value={todaysOrders.length.toString()}
                change="Live"
                icon={<ShoppingCart size={21}/>}
                />

                <StatCard
                title="Today's Revenue"
                value={formattedRevenue}
                change="Live"
                icon={<IndianRupee size={21}/>}
                />

                <StatCard 
                title="Customers"
                value="_"
                change="Comming Soon"
                icon={<Users size={21} />}
                />
                
                <StatCard
                title="Available Tables"
                value={ `${availableTables} / ${totaltables}` }
                change="Live"
                icon={<Armchair size={21} />}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Sales Overview
                            </h3>

                            <p className="text-sm text-slate-500">
                                Collected revenue: current {salesRange} days vs previous {salesRange} days
                            </p>
                        </div>

                        <select
                            value={salesRange}
                            onChange={(event) => setSalesRange(Number(event.target.value) as SalesRange)}
                            aria-label="Sales overview date range"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                        >
                           <option value={7}>Last 7 Days</option>
                           <option value={30}>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="mt-6 rounded-lg bg-slate-50 p-4">
                       <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap gap-4 text-slate-600">
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                                    Current period
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                                    Previous period
                                </span>
                            </div>
                            <span className="font-medium text-slate-700">
                                ₹{currentPeriodTotal.toLocaleString("en-IN")} vs ₹{previousPeriodTotal.toLocaleString("en-IN")}
                            </span>
                       </div>

                       <div className="h-52 overflow-x-auto pb-1">
                       <div className={`flex h-full items-end gap-2 ${salesRange === 30 ? "min-w-225" : "min-w-full"}`}>
                        {salesPeriods.map((day) => {
                            const currentHeight = day.current === 0
                                ? 1
                                : Math.max((day.current / maxRevenue) * 100, 8);
                            const previousHeight = day.previous === 0
                                ? 1
                                : Math.max((day.previous / maxRevenue) * 100, 8);
                            const label = salesRange === 7
                                ? day.date.toLocaleDateString("en-IN", {weekday: "short"})
                                : day.date.toLocaleDateString("en-IN", {day: "numeric", month: "short"});

                            return(
                                <div
                                key={getDateKey(day.date)}
                                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                >
                                    <div className="flex h-full w-full items-end justify-center gap-1">
                                        <div
                                        className="group relative w-1/2 rounded-t-md bg-orange-500 transition hover:bg-orange-600"
                                        style={{height: `${currentHeight}%`}}
                                        title={`Current: ₹${day.current.toLocaleString("en-IN")}`}
                                        >
                                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                                                ₹{day.current.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div
                                        className="group relative w-1/2 rounded-t-md bg-slate-300 transition hover:bg-slate-400"
                                        style={{height: `${previousHeight}%`}}
                                        title={`Previous: ₹${day.previous.toLocaleString("en-IN")}`}
                                        >
                                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                                                ₹{day.previous.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-xs text-slate-500">
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                       </div>
                    </div>
                </div>
                </div>
                <RecentOrders/> 
            </div>
        </div>
    );
};
export default Dashboard;