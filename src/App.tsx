import {Routes,Route,Navigate} from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./components/dashboard/Dashboard";
import MenuPage from "./components/MenuPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./components/OrdersPage";
import CustomerPage from "./components/CustomerPage";
import ReservationsPage from "./components/ReservationsPage";
import TablesPage from "./components/TablesPage";
import TableOrderPage from "./components/TableOrderPage";
import StaffPage from "./components/StaffPage";
import BillingPage from "./components/BillingPage";
import SettingsPage from "./components/SettingsPage";

import { TableProvider } from "./context/TableContext";
import { OrderProvider } from "./context/OrderContext";
import { MenuProvider } from "./context/MenuContext";
import { BillingProvider} from "./context/BillingContext";
import { StaffProvider } from "./context/StaffContext";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/ResturantContext";

function App () {
    return (
    <AuthProvider>
        <TableProvider>
            <OrderProvider>
                <MenuProvider>
                    <StaffProvider>
                        <BillingProvider>
                        <RestaurantProvider>
          
                        <Routes>

                        <Route path="/login" element={<LoginPage/>}/>

                        <Route element={<Layout/>}>
                        
                        <Route element={<ProtectedRoute permission="dashboard"/>}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        </Route>
                        
                        <Route element={<ProtectedRoute permission="menu"/>}>
                        <Route path="/menu" element={<MenuPage/>}/>
                        </Route>

                        <Route element={<ProtectedRoute permission="orders"/>}>
                        <Route path="/orders" element={<OrdersPage/>}/>
                        </Route>

                        <Route element={<ProtectedRoute permission="billing"/>}>
                        <Route path="/billing" element={<BillingPage/>}/>
                        </Route>
                        
                        <Route element={<ProtectedRoute permission="customers"/>}>
                        <Route path="/customers" element={<CustomerPage/>}/>
                        </Route>
                        
                        <Route element={<ProtectedRoute permission="reservations"/>}>
                        <Route path="/reservations" element={<ReservationsPage/>}/>
                        </Route>
                        
                        <Route element={<ProtectedRoute permission="tables"/>}>
                        <Route path="/tables" element={<TablesPage/>}/>
                        </Route>
                        
                        <Route path="/tables/:tableId/order" element={<TableOrderPage/>}/>

                        <Route element={<ProtectedRoute permission="staff"/>}>
                        <Route path="/staff" element={<StaffPage />} />
                        </Route>

                        <Route element={<ProtectedRoute permission="settings"/>}>
                        <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                        
                        <Route path="/" element={<Navigate to ="/login" replace/>}/></Route>

                        </Routes>
                                                </RestaurantProvider>
                                            </BillingProvider>  
                    </StaffProvider>
                </MenuProvider>
            </OrderProvider>
        </TableProvider>
    </AuthProvider>
    )
}
export default App;