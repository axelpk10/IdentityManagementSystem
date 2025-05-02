import React from "react";
import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this page.
        </p>
        <Link
          to="/profile"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-block"
        >
          Go to Profile
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
