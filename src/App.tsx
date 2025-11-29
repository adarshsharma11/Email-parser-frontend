import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, type ReactNode } from "react";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Bookings from "./pages/Bookings/Bookings";
import Crews from "./pages/Crews/Crews";
import AddCrew from "./pages/Crews/AddCrew";
import { Properties, AddProperty } from "./pages/Properties";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Users/Users";

import { AppProvider } from "./context/AppContext";
import { authService } from "./services";
import { useAuth } from "./context/AuthContext";

export default function App() {
  useEffect(() => {
    authService.initTokenFromStorage();
  }, []);
  const RequireAuth = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    if (!user.token) {
      return <Navigate to="/signin" replace />;
    }
    return <>{children}</>;
  };
  const RequireGuest = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    if (user.token) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Tables */}
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/crews" element={<Crews />} />
            <Route path="/crews/add" element={<AddCrew />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/add" element={<AddProperty />} />           
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<RequireGuest><SignIn /></RequireGuest>} />
          <Route path="/signup" element={<RequireGuest><SignUp /></RequireGuest>} />
          <Route path="/reset-password" element={<RequireGuest><ResetPassword /></RequireGuest>} />
          <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
