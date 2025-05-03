import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          You don't have permission to access this page. Please contact the
          administrator if you believe this is an error.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
