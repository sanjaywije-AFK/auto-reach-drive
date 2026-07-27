import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

import CustomerDashboard from "./pages/customer/Dashboard.tsx";
import Vehicles from "./pages/customer/Vehicles.tsx";
import BookService from "./pages/customer/BookService.tsx";
import TrackVehicle from "./pages/customer/TrackVehicle.tsx";
import BookingDetail from "./pages/customer/BookingDetail.tsx";
import ServiceHistory from "./pages/customer/ServiceHistory.tsx";
import Profile from "./pages/customer/Profile.tsx";

import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail.tsx";
import AdminDrivers from "./pages/admin/AdminDrivers.tsx";
import AdminServiceCenters from "./pages/admin/AdminServiceCenters.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";

import DriverJobs from "./pages/driver/DriverJobs.tsx";
import DriverJobDetail from "./pages/driver/DriverJobDetail.tsx";

const queryClient = new QueryClient();

const customer = (element: React.ReactNode) => <ProtectedRoute allow={["customer"]}>{element}</ProtectedRoute>;
const admin = (element: React.ReactNode) => <ProtectedRoute allow={["admin"]}>{element}</ProtectedRoute>;
const driver = (element: React.ReactNode) => <ProtectedRoute allow={["driver"]}>{element}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/dashboard" element={customer(<CustomerDashboard />)} />
            <Route path="/vehicles" element={customer(<Vehicles />)} />
            <Route path="/book" element={customer(<BookService />)} />
            <Route path="/track" element={customer(<TrackVehicle />)} />
            <Route path="/booking/:id" element={customer(<BookingDetail />)} />
            <Route path="/history" element={customer(<ServiceHistory />)} />
            <Route path="/profile" element={customer(<Profile />)} />

            <Route path="/admin" element={admin(<AdminDashboard />)} />
            <Route path="/admin/bookings" element={admin(<AdminBookings />)} />
            <Route path="/admin/bookings/:id" element={admin(<AdminBookingDetail />)} />
            <Route path="/admin/drivers" element={admin(<AdminDrivers />)} />
            <Route path="/admin/centers" element={admin(<AdminServiceCenters />)} />
            <Route path="/admin/customers" element={admin(<AdminCustomers />)} />

            <Route path="/driver" element={driver(<DriverJobs />)} />
            <Route path="/driver/completed" element={driver(<DriverJobs completed />)} />
            <Route path="/driver/job/:id" element={driver(<DriverJobDetail />)} />

            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
