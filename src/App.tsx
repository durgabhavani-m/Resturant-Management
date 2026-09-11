import {Routes,Route,Navigate} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import CustomerPage from "./pages/CustomerPage";
import ReservationsPage from "./pages/ReservationsPage";
import TablesPage from "./pages/TablesPage";
import { TableProvider} from "./context/TableContext";

function App () {
    return (

        <TableProvider>

        <Routes>

            <Route path="/login" element={<LoginPage/>}/>

            <Route element={<Layout/>}>

            <Route path="/dashboard" element={<Dashboard/>}/>
            
            <Route path="/menu" element={<MenuPage/>}/>

            <Route path="/orders" element={<OrdersPage/>}/>

            <Route path="/customers" element={<CustomerPage/>}/>

            <Route path="/reservations" element={<ReservationsPage/>}/>

            <Route path="/tables" element={<TablesPage/>}/>

            <Route path="/" element={<Navigate to ="/dashboard" replace/>}/>

            </Route>
        </Routes>

        </TableProvider>
    )
}
export default App;