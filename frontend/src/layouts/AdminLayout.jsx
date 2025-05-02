import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "../components/AdminNav";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
