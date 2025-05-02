import React from "react";

function SystemSettings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
          <p className="text-gray-600 italic mb-4">
            This is a placeholder. In a production app, you would have actual
            system settings here.
          </p>

          <div className="flex items-center p-4 bg-blue-50 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>System settings will be implemented in the next phase.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Smart Contract Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700">Contract Address</h3>
              <p className="font-mono text-sm mt-1">0x123...456</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700">Network</h3>
              <p className="mt-1">Local Development</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700">Admin Address</h3>
              <p className="font-mono text-sm mt-1">0x789...012</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-700">Contract Version</h3>
              <p className="mt-1">1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
