import {Bell, Search,ChevronDown} from "lucide-react";

const Navbar = () => {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bh-white px-6">

            <div className="relative w-72">

                <Search size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                <input 
                type="text"
                placeholder="Search...."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
            </div>

            <div className="flex items-center gap-5">

                <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <Bell size={20}/>
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-600"/>
                </button>

                <button className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                        A
                    </div>

                    <div className="hidden text-left sm:block">
                        <p className="text-sm font-semibold text-slate-800">
                            Admin
                        </p>

                        <p className="text-xs text-slate-400">
                            Administrator
                        </p>
                    </div>

                    <ChevronDown size={18}
                    className="text-slate-400"/>
                </button>
            </div>
        </header>
    );
};
export default Navbar;