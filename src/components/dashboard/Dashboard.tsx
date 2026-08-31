import {ShoppingCart, IndianRupee, Users, Armchair} from "lucide-react";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";

const Dashboard = () => {
    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Dashboard
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-900">
                   Welcome back! Here's what's happening today. 
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                
                <StatCard
                title="Today's Orders"
                value="124"
                change="+12.5%"
                icon={<ShoppingCart size={21}/>}
                />

                <StatCard
                title="Today's Revenue"
                value="₹48,250"
                change="+8.2%"
                icon={<IndianRupee size={21}/>}
                />

                <StatCard 
                title="Customers"
                value="1,240"
                change="+5.4%"
                icon={<Users size={21} />}
                />
                
                <StatCard
                title="Available Tables"
                value="18 / 30"
                change="60%"
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
                            <option>last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>

                    <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                        Sales Chart
                    </div>
                </div>

                <RecentOrders/>
                
            </div>
        </div>
    );
};
export default Dashboard;