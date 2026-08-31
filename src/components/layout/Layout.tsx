import{Outlet} from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


const Layout = () => {
    return (
        <div className="min-h-screen flex bg-slate-50">
            <Sidebar/>

            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar/>

                <main className=" p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};
export default Layout;