import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Report({ user }) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);

  // Dummy Data Generator
  const generateDummyData = (range, startDate = null, endDate = null) => {
    let dates = [];
    let currentDate = new Date();
    
    // Determine date range
    if (range === "daily") {
      dates = [new Date()];
    } else if (range === "weekly") {
      for (let i = 6; i >= 0; i--) {
        dates.push(new Date(currentDate.setDate(currentDate.getDate() - i)));
        currentDate = new Date();
      }
    } else if (range === "monthly") {
      for (let i = 29; i >= 0; i--) {
        dates.push(new Date(currentDate.setDate(currentDate.getDate() - i)));
        currentDate = new Date();
      }
    } else if (range === "quarterly") {
      for (let i = 89; i >= 0; i--) {
        dates.push(new Date(currentDate.setDate(currentDate.getDate() - i)));
        currentDate = new Date();
      }
    } else if (range === "yearly") {
      for (let i = 364; i >= 0; i--) {
        dates.push(new Date(currentDate.setDate(currentDate.getDate() - i)));
        currentDate = new Date();
      }
    } else if (range === "custom" && startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);
      while (start <= end) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }
    }

    // Generate random ticket data
    const statuses = ["Open", "In Progress", "Resolved", "Closed"];
    const priorities = ["Low", "Medium", "High", "Critical"];
    const categories = ["Hardware", "Software", "Network", "Database", "Security"];
    
    const generatedTickets = [];
    let totalTickets = 0;
    let resolvedTickets = 0;
    let openTickets = 0;
    let inProgressTickets = 0;
    let criticalTickets = 0;
    let highTickets = 0;
    let totalResponseTime = 0;
    let totalResolutionTime = 0;

    dates.forEach((date, index) => {
      const ticketsCount = Math.floor(Math.random() * 10) + 1;
      totalTickets += ticketsCount;
      
      for (let i = 0; i < ticketsCount; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const responseTime = Math.floor(Math.random() * 48) + 1;
        const resolutionTime = status === "Resolved" || status === "Closed" 
          ? Math.floor(Math.random() * 120) + 5 
          : null;
        
        if (status === "Resolved" || status === "Closed") resolvedTickets++;
        if (status === "Open") openTickets++;
        if (status === "In Progress") inProgressTickets++;
        if (priority === "Critical") criticalTickets++;
        if (priority === "High") highTickets++;
        
        totalResponseTime += responseTime;
        if (resolutionTime) totalResolutionTime += resolutionTime;
        
        generatedTickets.push({
          id: `TKT-${String(index + 1).padStart(4, "0")}`,
          title: `${category} Issue: ${Math.random().toString(36).substring(7)}`,
          description: `Detailed description of the ${category.toLowerCase()} problem...`,
          status,
          priority,
          category,
          createdAt: date.toISOString(),
          resolvedAt: resolutionTime ? new Date(date.getTime() + resolutionTime * 3600000).toISOString() : null,
          responseTime: `${responseTime}h`,
          resolutionTime: resolutionTime ? `${resolutionTime}h` : "Pending",
          assignedTo: Math.random() > 0.5 ? "IT Support Team" : "System Admin",
        });
      }
    });

    const avgResponseTime = totalTickets > 0 ? (totalResponseTime / totalTickets).toFixed(1) : 0;
    const avgResolutionTime = resolvedTickets > 0 ? (totalResolutionTime / resolvedTickets).toFixed(1) : 0;
    const satisfactionRate = resolvedTickets > 0 ? Math.floor(Math.random() * 30) + 70 : 0;

    return {
      summary: {
        totalTickets,
        resolvedTickets,
        openTickets,
        inProgressTickets,
        criticalTickets,
        highTickets,
        avgResponseTime: `${avgResponseTime}h`,
        avgResolutionTime: `${avgResolutionTime}h`,
        satisfactionRate: `${satisfactionRate}%`,
        resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0,
      },
      tickets: generatedTickets,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1],
      },
    };
  };

  // Load report data
  useEffect(() => {
    loadReportData();
  }, [dateRange, customStartDate, customEndDate]);

  const loadReportData = () => {
    setLoading(true);
    setTimeout(() => {
      let startDate = null;
      let endDate = null;
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      }
      
      const data = generateDummyData(dateRange, startDate, endDate);
      setReportData(data);
      setTicketsData(data.tickets);
      setLoading(false);
    }, 800);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 100);
    doc.text("IT Support Ticket Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
    doc.text(`Report Period: ${formatDateRange()}`, pageWidth / 2, 37, { align: "center" });
    doc.text(`Generated by: ${user?.name} (${user?.role})`, pageWidth / 2, 44, { align: "center" });
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Executive Summary", 14, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const summaryData = [
      ["Total Tickets", reportData.summary.totalTickets],
      ["Resolved Tickets", reportData.summary.resolvedTickets],
      ["Open Tickets", reportData.summary.openTickets],
      ["In Progress", reportData.summary.inProgressTickets],
      ["Resolution Rate", `${reportData.summary.resolutionRate}%`],
      ["Avg Response Time", reportData.summary.avgResponseTime],
      ["Avg Resolution Time", reportData.summary.avgResolutionTime],
      ["Satisfaction Rate", reportData.summary.satisfactionRate],
    ];
    
    let yPos = 68;
    summaryData.forEach((item, index) => {
      doc.text(item[0], 14, yPos + (index * 7));
      doc.text(String(item[1]), 80, yPos + (index * 7));
    });
    
    // Priority Distribution
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Priority Distribution", 14, 130);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const priorityData = [
      ["Critical", reportData.summary.criticalTickets],
      ["High", reportData.summary.highTickets],
      ["Medium", reportData.summary.totalTickets - reportData.summary.criticalTickets - reportData.summary.highTickets - (reportData.summary.openTickets + reportData.summary.resolvedTickets)],
    ];
    
    priorityData.forEach((item, index) => {
      doc.text(item[0], 14, 145 + (index * 7));
      doc.text(String(item[1]), 80, 145 + (index * 7));
    });
    
    // Tickets Table
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Detailed Ticket List", 14, 20);
    
    const tableColumn = ["ID", "Title", "Status", "Priority", "Category", "Created", "Response Time"];
    const tableRows = ticketsData.slice(0, 20).map(ticket => [
      ticket.id,
      ticket.title.substring(0, 30),
      ticket.status,
      ticket.priority,
      ticket.category,
      new Date(ticket.createdAt).toLocaleDateString(),
      ticket.responseTime,
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 100], textColor: 255, fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    
    doc.save(`ticket_report_${dateRange}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Ticket ID", "Title", "Status", "Priority", "Category", "Created Date", "Resolved Date", "Response Time", "Resolution Time", "Assigned To"];
    
    const rows = ticketsData.map(ticket => [
      ticket.id,
      ticket.title,
      ticket.status,
      ticket.priority,
      ticket.category,
      new Date(ticket.createdAt).toLocaleString(),
      ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : "Not resolved",
      ticket.responseTime,
      ticket.resolutionTime,
      ticket.assignedTo,
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `ticket_report_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(ticketsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, `ticket_report_${dateRange}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const formatDateRange = () => {
    if (!reportData) return "";
    if (dateRange === "custom") {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
    }
    return `${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()}`;
  };

  const timeFrames = [
    { value: "daily", label: "Daily", icon: "📅" },
    { value: "weekly", label: "Weekly", icon: "📊" },
    { value: "monthly", label: "Monthly", icon: "📈" },
    { value: "quarterly", label: "Quarterly", icon: "📉" },
    { value: "yearly", label: "Yearly", icon: "📆" },
    { value: "custom", label: "Custom", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track and analyze your IT support tickets</p>
            </div>
            
            {/* Export Buttons */}
            {reportData && (
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Time Frame Selector */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Time Frame</label>
          <div className="flex flex-wrap gap-3">
            {timeFrames.map((tf) => (
              <button
                key={tf.value}
                onClick={() => {
                  setDateRange(tf.value);
                  if (tf.value !== "custom") setShowCustomPicker(false);
                  else setShowCustomPicker(true);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-200 ${
                  dateRange === tf.value
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{tf.icon}</span>
                <span>{tf.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          {showCustomPicker && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={loadReportData}
                disabled={!customStartDate || !customEndDate}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Apply Custom Range
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Report Content */}
        {!loading && reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm opacity-90">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{reportData.summary.totalTickets}</p>
                <p className="text-xs opacity-75 mt-2">in selected period</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm opacity-90">Resolution Rate</p>
                <p className="text-3xl font-bold mt-2">{reportData.summary.resolutionRate}%</p>
                <p className="text-xs opacity-75 mt-2">{reportData.summary.resolvedTickets} resolved tickets</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm opacity-90">Avg Response Time</p>
                <p className="text-3xl font-bold mt-2">{reportData.summary.avgResponseTime}</p>
                <p className="text-xs opacity-75 mt-2">first response time</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm opacity-90">Satisfaction Rate</p>
                <p className="text-3xl font-bold mt-2">{reportData.summary.satisfactionRate}</p>
                <p className="text-xs opacity-75 mt-2">based on feedback</p>
              </div>
            </div>

            {/* Date Range Info */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Report Period:</span>
                <span className="text-sm font-semibold text-gray-800">{formatDateRange()}</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cold-2 gap-6 mb-6">
              {/* Status Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Status Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Open Tickets</span>
                      <span>{reportData.summary.openTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(reportData.summary.openTickets / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>In Progress</span>
                      <span>{reportData.summary.inProgressTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(reportData.summary.inProgressTickets / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Resolved/Closed</span>
                      <span>{reportData.summary.resolvedTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(reportData.summary.resolvedTickets / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Critical</span>
                      <span>{reportData.summary.criticalTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(reportData.summary.criticalTickets / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>High</span>
                      <span>{reportData.summary.highTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(reportData.summary.highTickets / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Medium/Low</span>
                      <span>{reportData.summary.totalTickets - reportData.summary.criticalTickets - reportData.summary.highTickets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((reportData.summary.totalTickets - reportData.summary.criticalTickets - reportData.summary.highTickets) / reportData.summary.totalTickets) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Recent Tickets</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketsData.slice(0, 10).map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === "Resolved" || ticket.status === "Closed" ? "bg-green-100 text-green-800" :
                            ticket.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === "Critical" ? "bg-red-100 text-red-800" :
                            ticket.priority === "High" ? "bg-orange-100 text-orange-800" :
                            ticket.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.responseTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}