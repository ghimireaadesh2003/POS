import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

import CustomerLayout from "@/components/customer/CustomerLayout";
import MenuPage from "@/pages/customer/MenuPage";
import OrderStatusPage from "@/pages/customer/OrderStatusPage";
import OrderHistoryPage from "@/pages/customer/OrderHistoryPage";
import BillPage from "@/pages/customer/BillPage";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import LiveOrders from "@/pages/admin/LiveOrders";
import TableManagement from "@/pages/admin/TableManagement";
import MenuManagement from "@/pages/admin/MenuManagement";
import KitchenDisplay from "@/pages/admin/KitchenDisplay";
import InventoryManagement from "@/pages/admin/InventoryManagement";
import Analytics from "@/pages/admin/Analytics";
import Customers from "@/pages/admin/Customers";
import Settings from "@/pages/admin/Settings";
import OutletManagement from "@/pages/admin/OutletManagement";
import ReservationManagement from "@/pages/admin/ReservationManagement";
import FeedbackPage from "@/pages/customer/FeedbackPage";
import { MenuProvider } from "@/contexts/MenuContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // data is fresh for 30s
      refetchOnWindowFocus: true,  // refetch when tab gets focus back
      refetchOnReconnect: true,    // refetch when network reconnects
      retry: 2,                    // retry failed queries twice
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing redirect */}
            {/* Landing redirect - remove hardcoded table */}
            <Route path="/" element={<Navigate to="/menu" replace />} />

            {/* Customer Routes */}
            <Route element={<CartProvider><CustomerLayout /></CartProvider>}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<Navigate to="/order-status" replace />} />
              <Route path="/order-status" element={<OrderStatusPage />} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/bill" element={<BillPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <AdminRouteGuard>
                <AdminThemeProvider>
                  <NotificationProvider>
                    <MenuProvider>
                      <AdminLayout />
                    </MenuProvider>
                  </NotificationProvider>
                </AdminThemeProvider>
              </AdminRouteGuard>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<LiveOrders />} />
              <Route path="tables" element={<TableManagement />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="kitchen" element={<KitchenDisplay />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="outlets" element={<OutletManagement />} />
              <Route path="reservations" element={<ReservationManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
