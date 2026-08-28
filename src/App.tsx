import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Language } from "./lib/translations";
import { AboutUs } from "./screens/AboutUs/AboutUs";
import { AdminBookings } from "./screens/Admin/AdminBookings";
import { AdminClients } from "./screens/Admin/AdminClients";
import { AdminDashboardOverview } from "./screens/Admin/AdminDashboardOverview";
import { AdminSessions } from "./screens/Admin/AdminSessions";
import { AdminSettings } from "./screens/Admin/AdminSettings";
import { DashboardBookings } from "./screens/Dashboard/DashboardBookings";
import { DashboardOverview } from "./screens/Dashboard/DashboardOverview";
import { DashboardProfile } from "./screens/Dashboard/DashboardProfile";
import { Desktop } from "./screens/Desktop/Desktop";
import { Login } from "./screens/Login/Login";
import { Signup } from "./screens/Signup/Signup";

export const App = (): JSX.Element => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Desktop lang={lang} setLang={setLang} />} />
          <Route path="/about" element={<AboutUs lang={lang} setLang={setLang} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute access="dashboard" />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/bookings" element={<DashboardBookings />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
          </Route>

          <Route element={<ProtectedRoute access="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardOverview />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
