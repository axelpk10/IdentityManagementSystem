import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// Import module pages
import AdminDashboard from "./pages/admin/Dashboard";
import IssuerDashboard from "./pages/Issuer/Dashboard";
import UserDashboard from "./pages/user/Dashboard";
import VerifierDashboard from "./pages/verifier/Dashboard";

import NetworkChecker from "./components/common/NetworkChecker";
import Footer from "./components/common/Footer";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <NetworkChecker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes for each module */}
              {/* You'll implement these pages later */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/issuer/*"
                element={
                  <ProtectedRoute allowedRoles={["issuer"]}>
                    <IssuerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user/*"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/verifier/*"
                element={
                  <ProtectedRoute allowedRoles={["verifier"]}>
                    <VerifierDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
