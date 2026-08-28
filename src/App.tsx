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
import { AdminSessionForm } from "./screens/Admin/AdminSessionForm";
import { AdminTaxonomy } from "./screens/Admin/AdminTaxonomy";
import { AdminProfile } from "./screens/Admin/AdminProfile";
import { AdminSettings } from "./screens/Admin/AdminSettings";
import { DashboardBookings } from "./screens/Dashboard/DashboardBookings";
import { DashboardOverview } from "./screens/Dashboard/DashboardOverview";
import { DashboardProfile } from "./screens/Dashboard/DashboardProfile";
import { Desktop } from "./screens/Desktop/Desktop";
import { Login } from "./screens/Login/Login";
import { ForgotPassword } from "./screens/Login/ForgotPassword";
import { ResetPassword } from "./screens/Login/ResetPassword";
import { Signup } from "./screens/Signup/Signup";
import { NotAuthorized } from "./screens/NotAuthorized/NotAuthorized";
import { Logout } from "./screens/Logout/Logout";
import { Profile } from "./screens/Profile/Profile";

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/logout" element={<Logout />} />

          <Route element={<ProtectedRoute access="any" />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute access="dashboard" />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/bookings" element={<DashboardBookings />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
          </Route>

          <Route element={<ProtectedRoute access="admin" />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardOverview />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/sessions/new" element={<AdminSessionForm />} />
            <Route path="/admin/sessions/edit/:id" element={<AdminSessionForm />} />
            <Route path="/admin/taxonomy" element={<AdminTaxonomy />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
