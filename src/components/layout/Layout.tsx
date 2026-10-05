import{Outlet} from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


const Layout = () => {
    return (
        <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-slate-50">
            <Sidebar/>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <Navbar/>

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};
export default Layout;