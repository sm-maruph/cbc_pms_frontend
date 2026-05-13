import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Import API functions
import { getReportData } from "../../services/api";

export default function Report({ user }) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [useUploadedData, setUseUploadedData] = useState(false);

  const token = localStorage.getItem("cbcToken");

  // Fetch report data from API
  const fetchReportData = async (range, startDate = null, endDate = null) => {
    if (!token) return;
    
    setLoading(true);
    try {
      let reportRange = range;
      let sDate = startDate;
      let eDate = endDate;
      
      if (range === "custom" && startDate && endDate) {
        reportRange = "custom";
      }
      
      const data = await getReportData(reportRange, sDate, eDate, token);
      
      if (data && data.tickets) {
        // Transform API data to match the expected format
        const transformedTickets = data.tickets.map(ticket => ({
          id: ticket.id,
          ticket_sl: ticket.ticket_sl,
          title: ticket.system_name || "N/A",
          description: ticket.problem_details || "",
          status: ticket.status || "open",
          priority: ticket.risk_label || "MEDIUM",
          category: ticket.system_name || "General",
          createdAt: ticket.created_at,
          resolvedAt: ticket.up_time,
          responseTime: calculateResponseTime(ticket.created_at, ticket.updated_at),
          resolutionTime: ticket.up_time ? calculateTimeDiff(ticket.created_at, ticket.up_time) : "Pending",
          assignedTo: ticket.assigned_to_name || "Unassigned",
          reportedBy: ticket.reportedByName || ticket.reported_by_email,
          systemName: ticket.system_name,
          department: ticket.department,
          branch: ticket.branch,
          affectedUser: ticket.affected_user,
          pcName: ticket.pc_name,
          downTime: ticket.down_time,
          upTime: ticket.up_time,
          rootCause: ticket.root_cause,
          resolution: ticket.resolution,
          remarks: ticket.remarks,
        }));
        
        setTicketsData(transformedTickets);
        setReportData({
          summary: data.summary || calculateSummary(transformedTickets),
          tickets: transformedTickets,
          dateRange: {
            start: data.startDate || new Date(),
            end: data.endDate || new Date(),
          },
        });
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateResponseTime = (createdAt, updatedAt) => {
    if (!createdAt) return "0h";
    const created = new Date(createdAt);
    const updated = new Date(updatedAt || new Date());
    const hours = Math.round((updated - created) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const calculateTimeDiff = (start, end) => {
    if (!start || !end) return "Pending";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.round((endDate - startDate) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const calculateSummary = (tickets) => {
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
    const openTickets = tickets.filter(t => t.status === "open").length;
    const inProgressTickets = tickets.filter(t => t.status === "in-progress").length;
    const criticalTickets = tickets.filter(t => t.priority === "HIGH").length;
    const highTickets = tickets.filter(t => t.priority === "HIGH").length;
    
    const totalResponseTime = tickets.reduce((sum, t) => {
      const time = parseInt(t.responseTime) || 0;
      return sum + time;
    }, 0);
    
    const totalResolutionTime = tickets
      .filter(t => t.status === "resolved" && t.resolutionTime !== "Pending")
      .reduce((sum, t) => {
        const time = parseInt(t.resolutionTime) || 0;
        return sum + time;
      }, 0);
    
    const avgResponseTime = totalTickets > 0 ? (totalResponseTime / totalTickets).toFixed(1) : 0;
    const avgResolutionTime = resolvedTickets > 0 ? (totalResolutionTime / resolvedTickets).toFixed(1) : 0;
    const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0;
    
    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      criticalTickets,
      highTickets,
      avgResponseTime: `${avgResponseTime}h`,
      avgResolutionTime: `${avgResolutionTime}h`,
      satisfactionRate: "85%",
      resolutionRate,
    };
  };

  // Load report data when range changes
  useEffect(() => {
    if (!useUploadedData) {
      if (dateRange === "custom" && customStartDate && customEndDate) {
        fetchReportData("custom", customStartDate, customEndDate);
      } else if (dateRange !== "custom") {
        fetchReportData(dateRange);
      }
    }
  }, [dateRange, customStartDate, customEndDate, useUploadedData]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform uploaded data to match ticket format
      const transformedData = jsonData.map((row, index) => ({
        id: row.id || index + 1,
        ticket_sl: row.ticket_sl || `UPLOAD-${index + 1}`,
        title: row.system_name || row.title || "N/A",
        description: row.problem_details || row.description || "",
        status: row.status?.toLowerCase() || "open",
        priority: row.risk_label || row.priority || "MEDIUM",
        category: row.system_name || "General",
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        resolvedAt: row.up_time || row.resolvedAt || null,
        responseTime: row.response_time || row.responseTime || "0h",
        resolutionTime: row.resolution_time || row.resolutionTime || "Pending",
        assignedTo: row.assigned_to_name || row.assignedTo || "Unassigned",
        reportedBy: row.reportedByName || row.reported_by_email || "Unknown",
        systemName: row.system_name,
        department: row.department,
        branch: row.branch,
        affectedUser: row.affected_user,
        pcName: row.pc_name,
        downTime: row.down_time,
        upTime: row.up_time,
        rootCause: row.root_cause,
        resolution: row.resolution,
        remarks: row.remarks,
      }));
      
      setUploadedData(transformedData);
      setTicketsData(transformedData);
      setReportData({
        summary: calculateSummary(transformedData),
        tickets: transformedData,
        dateRange: { start: new Date(), end: new Date() },
      });
      setUseUploadedData(true);
      setShowUploadModal(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // Switch back to live data
  const useLiveData = () => {
    setUseUploadedData(false);
    setUploadedData(null);
    fetchReportData(dateRange);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 100);
    doc.text("IT Support Ticket Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
    doc.text(`Report Period: ${formatDateRange()}`, pageWidth / 2, 37, { align: "center" });
    doc.text(`Generated by: ${user?.name} (${user?.role})`, pageWidth / 2, 44, { align: "center" });
    doc.text(`Data Source: ${useUploadedData ? "Uploaded File" : "Live Database"}`, pageWidth / 2, 51, { align: "center" });
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Executive Summary", 14, 70);
    
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
    
    let yPos = 78;
    summaryData.forEach((item, index) => {
      doc.text(item[0], 14, yPos + (index * 7));
      doc.text(String(item[1]), 80, yPos + (index * 7));
    });
    
    // Priority Distribution
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Priority Distribution", 14, 140);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const priorityData = [
      ["Critical", reportData.summary.criticalTickets],
      ["High", reportData.summary.highTickets],
      ["Medium/Low", reportData.summary.totalTickets - reportData.summary.criticalTickets - reportData.summary.highTickets],
    ];
    
    priorityData.forEach((item, index) => {
      doc.text(item[0], 14, 155 + (index * 7));
      doc.text(String(item[1]), 80, 155 + (index * 7));
    });
    
    // Tickets Table
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Detailed Ticket List", 14, 20);
    
    const tableColumn = ["SL No", "System", "Status", "Priority", "Created", "Response Time"];
    const tableRows = ticketsData.slice(0, 20).map(ticket => [
      ticket.ticket_sl || ticket.id,
      ticket.systemName?.substring(0, 30) || ticket.title?.substring(0, 30) || "N/A",
      ticket.status,
      ticket.priority,
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
    const headers = ["Ticket SL", "System", "Status", "Priority", "Department", "Branch", "Created Date", "Resolved Date", "Response Time", "Resolution Time", "Assigned To", "Reported By"];
    
    const rows = ticketsData.map(ticket => [
      ticket.ticket_sl || ticket.id,
      ticket.systemName || ticket.title,
      ticket.status,
      ticket.priority,
      ticket.department || "N/A",
      ticket.branch || "N/A",
      new Date(ticket.createdAt).toLocaleString(),
      ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : "Not resolved",
      ticket.responseTime,
      ticket.resolutionTime,
      ticket.assignedTo,
      ticket.reportedBy,
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
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Data
                </button>
                {useUploadedData && (
                  <button
                    onClick={useLiveData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Live Data
                  </button>
                )}
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
          
          {/* Data Source Indicator */}
          {useUploadedData && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Currently viewing uploaded data (not live)
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Upload Previous Data</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">Upload Excel or CSV file containing previous ticket data</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="text-xs text-gray-500 mb-4">
                <p>Supported formats: .xlsx, .xls, .csv</p>
                <p>File should contain columns like: ticket_sl, system_name, status, risk_label, etc.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                  if (!useUploadedData) setUseUploadedData(false);
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
                onClick={() => {
                  if (!useUploadedData) fetchReportData("custom", customStartDate, customEndDate);
                }}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketsData.slice(0, 10).map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{ticket.ticket_sl || ticket.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.systemName || ticket.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === "resolved" ? "bg-green-100 text-green-800" :
                            ticket.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === "HIGH" ? "bg-red-100 text-red-800" :
                            ticket.priority === "MEDIUM" ? "bg-orange-100 text-orange-800" :
                            "bg-blue-100 text-blue-800"
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