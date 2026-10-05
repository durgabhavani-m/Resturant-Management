import {ShoppingCart, IndianRupee, Users, Armchair} from "lucide-react";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";

import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { useTable } from "../../context/TableContext";

const Dashboard = () => {

    const {user} = useAuth();
    const {orders} =useOrder();
    const {tables} = useTable();

    const today = new Date().toISOString().split("T")[0];
    
    const todaysOrders = orders.filter(
        (order) => order.createdAt.split("T")[0] === today
    );

    const todayRevenue = todaysOrders.reduce(
        (total,order) => total + order.total, 0
    );

    const last7DaysSales = Array.from({length:7},(_, index) => {
        const date = new Date();

        date.setDate(date.getDate() - (6 - index));

        const dateKey = date.toISOString().split("T")[0];

        const revenue = orders
        .filter((order) => order.createdAt.split("T")[0] === dateKey)
        .reduce((total,order) => total+order.total,0);

        return {
            date: dateKey,
            revenue,
        };
    });

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
                                Revenue for the last 7 days
                            </p>
                        </div>

                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
                           <option>Last 7 Days</option>
                           <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="mt-6 h-64 rounded-lg bg-slate-50 p-4">
                       <div className="flex h-full items-end gap-3">
                        { last7DaysSales.map((day)=>{
                            const maxRevenue = Math.max(
                                ...last7DaysSales.map((item) => item.revenue),1
                            );

                            const height = day.revenue === 0 
                            ? 4
                            : Math.max((day.revenue / maxRevenue) * 100, 8);

                            const date = new Date(` ${day.date}T00:00:00`);

                            return(
                                <div
                                key={day.date}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                >
                                    <div className="flex h-full w-full items-end">
                                        <div
                                        className="group relative w-full roundded-t-md bg-orange-500 transition hover:bg-orange-600"
                                        style={{height: `${height}%`}}
                                        title={`₹${day.revenue.toLocaleString("en-IN")}`}
                                        >
                                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                                                ₹{day.revenue.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-xs text-slate-500">
                                        {date.toLocaleDateString("en-In",{
                                            weekday: "short",
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                       </div>
                    </div>
                </div>
                <RecentOrders/> 
            </div>
        </div>
    );
};
export default Dashboard;