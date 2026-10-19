import {Routes,Route,Navigate} from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./components/dashboard/Dashboard";
import MenuPage from "./components/menu/MenuPage";
import CategoryManagementPage from "./components/categories/CategoryManagementPage";
import ModifierManagementPage from "./components/modifiers/ModifierManagement";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPassword from "./pages/ForgotPassword";
import OrdersPage from "./components/OrdersPage";
import ReservationsPage from "./components/reservation/ReservationsPage";
import TablesPage from "./components/table/TablesPage";
import TableOrderPage from "./components/table/TableOrderPage";
import StaffPage from "./components/staff/StaffPage";
import BillingPage from "./components/BillingPage";
import SettingsPage from "./components/settings/SettingsPage";
import { AppThemeProvider } from "./components/settings/ThemeContext";


import { TableProvider } from "./context/TableContext";
import { OrderProvider } from "./context/OrderContext";
import { MenuProvider } from "./context/MenuContext";
import { ModifierProvider } from "./context/ModifierContext";
import { BillingProvider} from "./context/BillingContext";
import { StaffProvider } from "./context/StaffContext";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/ResturantContext";
import { RoleProvider } from "./context/RoleContext";

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <ModifierProvider>
          <TableProvider>
            <OrderProvider>
              <MenuProvider>
                <RoleProvider>
                  <StaffProvider>
                    <BillingProvider>
                      <RestaurantProvider>
                        <Routes>
                          <Route
                            path="/login"
                            element={<LoginPage />}
                          />

                          <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                          />

                          <Route
                            path="/reset-password"
                            element={<ResetPasswordPage />}
                          />

                          <Route element={<Layout />}>
                            <Route
                              element={
                                <ProtectedRoute permission="dashboard" />
                              }
                            >
                              <Route
                                path="/dashboard"
                                element={<Dashboard />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="menu" />
                              }
                            >
                              <Route
                                path="/menu"
                                element={<MenuPage />}
                              />
                              <Route
                                path="/categories"
                                element={<CategoryManagementPage />}
                              />
                              <Route
                                path="/modifiers"
                                element={<ModifierManagementPage />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="orders" />
                              }
                            >
                              <Route
                                path="/orders"
                                element={<OrdersPage />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="billing" />
                              }
                            >
                              <Route
                                path="/billing"
                                element={<BillingPage />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="reservations" />
                              }
                            >
                              <Route
                                path="/reservations"
                                element={<ReservationsPage />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="tables" />
                              }
                            >
                              <Route
                                path="/tables"
                                element={<TablesPage />}
                              />
                            </Route>

                            <Route
                              path="/tables/:tableId/order"
                              element={<TableOrderPage />}
                            />

                            <Route
                              element={
                                <ProtectedRoute permission="staff" />
                              }
                            >
                              <Route
                                path="/staff"
                                element={<StaffPage />}
                              />
                            </Route>

                            <Route
                              element={
                                <ProtectedRoute permission="settings" />
                              }
                            >
                              <Route
                                path="/settings"
                                element={<SettingsPage />}
                              />
                            </Route>

                            <Route
                              path="/"
                              element={
                                <Navigate to="/login" replace />
                              }
                            />
                          </Route>
                        </Routes>
                      </RestaurantProvider>
                    </BillingProvider>
                  </StaffProvider>
                </RoleProvider>
              </MenuProvider>
            </OrderProvider>
          </TableProvider>
        </ModifierProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;
