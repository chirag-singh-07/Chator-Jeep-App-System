import React from "react";

const DeletionRequestPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deletion Requests
          </h1>
          <p className="text-gray-600">Manage user account deletion requests</p>
        </div>
      </div>

      {/* Making the page for request delete page with the all stats and request in the table format  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500">Total Requests</h3>
          <p className="text-3xl font-bold text-gray-900">50</p>
        </div>
        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500">Pending Requests</h3>
          <p className="text-3xl font-bold text-gray-900">10</p>
        </div>
        {/* Completed Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500">Completed Requests</h3>
          <p className="text-3xl font-bold text-gray-900">40</p>
        </div>
        {/* Cancelled Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500">Cancelled Requests</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>
    </main>
  );
};

export default DeletionRequestPage;
