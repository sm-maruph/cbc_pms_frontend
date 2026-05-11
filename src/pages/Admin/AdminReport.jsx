import React, { useState, useEffect } from "react";

export default function AdminReport({ user }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");

  useEffect(() => {
    // Fetch admin report data from API
    const fetchReport = async () => {
      try {
        // Replace with your API call
        // const response = await axios.get(`/api/reports/admin?range=${dateRange}`);
        // setReportData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching report:", error);
        setLoading(false);
      }
    };

    fetchReport();
  }, [dateRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Reports</h1>
          
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Total Tickets</p>
                <p className="text-2xl font-bold">{reportData?.totalTickets || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Resolved Tickets</p>
                <p className="text-2xl font-bold">{reportData?.resolvedTickets || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Open Tickets</p>
                <p className="text-2xl font-bold">{reportData?.openTickets || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Active Users</p>
                <p className="text-2xl font-bold">{reportData?.activeUsers || 0}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Tickets by Status</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Pie Chart Placeholder</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Tickets by Priority</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Bar Chart Placeholder</p>
                </div>
              </div>
              <div className="border rounded-lg p-4 lg:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-4">Ticket Trends Over Time</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Line Chart Placeholder</p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Export Report as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}