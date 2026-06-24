import React, { useState, useEffect, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FileText, Download, Upload, RefreshCw, Search, X, Filter,
  Calendar, CheckCircle, AlertCircle, AlertTriangle, Clock, Activity,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown,
  Server, MapPin, Layout, User, Eye, FileSpreadsheet, FileDown,
  Database, TrendingUp, Trash2, Info,
} from "lucide-react";

// Import API functions
import { getReportData, bulkImportTickets, validateBulkTickets } from "../../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const TIME_FRAMES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const STATUS_CFG = {
  open: { color: "bg-red-500/20 text-red-300", dot: "bg-red-500", label: "Open" },
  "in-progress": { color: "bg-amber-500/20 text-amber-300", dot: "bg-amber-500", label: "In Progress" },
  resolved: { color: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-500", label: "Resolved" },
  pending: { color: "bg-gray-600/40 text-gray-300", dot: "bg-gray-500", label: "Pending" },
};

const RISK_CFG = {
  HIGH: { color: "bg-red-500/20 text-red-300", label: "High" },
  MEDIUM: { color: "bg-orange-500/20 text-orange-300", label: "Medium" },
  LOW: { color: "bg-blue-500/20 text-blue-300", label: "Low" },
};

// Sortable columns — key maps to a value extractor for logical sorting
const SORT_ACCESSORS = {
  ticket_sl: t => t.ticket_sl || "",
  system: t => (t.systemName || "").toLowerCase(),
  department: t => (t.department || "").toLowerCase(),
  branch: t => (t.branch || "").toLowerCase(),
  status: t => t.status || "",
  priority: t => ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[t.priority] || 0), // logical risk order
  createdAt: t => new Date(t.createdAt).getTime() || 0,
  responseTime: t => parseInt(t.responseTime) || 0,
  resolutionTime: t => (t.resolutionTime === "Pending" ? Infinity : parseInt(t.resolutionTime) || 0),
  reportedBy: t => (t.reportedBy || "").toLowerCase(),
  assignedTo: t => (t.assignedTo || "").toLowerCase(),
};

const PAGE_SIZE = 25;
const MINI_COLORS = {
  indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

// ─── Small UI building blocks (dark theme) ───────────────────────────────────
const MiniStat = ({ label, value, sub, color = "indigo", Icon }) => (
  <div className={`bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-3 flex items-center gap-3`}>
    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${MINI_COLORS[color]}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide truncate">{label}</p>
      <p className="text-lg font-bold text-gray-100 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 truncate">{sub}</p>}
    </div>
  </div>
);

const DistBar = ({ label, value, total, barCls }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-gray-300 font-bold">{value} <span className="text-gray-500 font-normal">({total > 0 ? Math.round((value / total) * 100) : 0}%)</span></span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div className={`${barCls} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
    </div>
  </div>
);

const Spinner = () => (
  <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
);

const selCls = "px-3 py-2.5 border border-gray-600 bg-gray-700/60 text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer";

// ─── Main component ───────────────────────────────────────────────────────────
export default function Report({ user }) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("weekly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);

  // ── Query engine: search, selection filters, sorting, pagination ──
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSystem, setFilterSystem] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // ── Upload / import flow ──
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [useUploadedData, setUseUploadedData] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const token = localStorage.getItem("cbcToken");

  // ── Helpers ──
  const calculateResponseTime = (createdAt, updatedAt) => {
    if (!createdAt) return "0h";
    const hours = Math.round((new Date(updatedAt || new Date()) - new Date(createdAt)) / 36e5);
    return `${hours}h`;
  };

  const calculateTimeDiff = (start, end) => {
    if (!start || !end) return "Pending";
    return `${Math.round((new Date(end) - new Date(start)) / 36e5)}h`;
  };

  // ── Fetch report data from API ──
  const fetchReportData = useCallback(async (range, startDate = null, endDate = null) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getReportData(range, startDate, endDate, token);
      if (data && data.tickets) {
        const transformed = data.tickets.map(t => ({
          id: t.id,
          ticket_sl: t.ticket_sl,
          description: t.problem_details || "",
          status: t.status || "open",
          priority: (t.risk_label || "MEDIUM").toUpperCase(),
          createdAt: t.created_at,
          resolvedAt: t.up_time,
          responseTime: calculateResponseTime(t.created_at, t.updated_at),
          resolutionTime: t.up_time ? calculateTimeDiff(t.created_at, t.up_time) : "Pending",
          assignedTo: t.assigned_to_name || "Unassigned",
          reportedBy: t.reportedByName || t.reported_by_email,
          systemName: t.system_name || "N/A",
          department: t.department || "",
          branch: t.branch || "",
          affectedUser: t.affected_user,
          pcName: t.pc_name,
          downTime: t.down_time,
          upTime: t.up_time,
          rootCause: t.root_cause,
          resolution: t.resolution,
          remarks: t.remarks,
        }));
        setTicketsData(transformed);
        setReportData({
          dateRange: { start: data.startDate || new Date(), end: data.endDate || new Date() },
        });
        setPage(1);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!useUploadedData) {
      if (dateRange === "custom" && customStartDate && customEndDate) {
        fetchReportData("custom", customStartDate, customEndDate);
      } else if (dateRange !== "custom") {
        fetchReportData(dateRange);
      }
    }
  }, [dateRange, customStartDate, customEndDate, useUploadedData, fetchReportData]);

  // ── Unique option lists derived from the loaded data ──
  const options = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return {
      systems: uniq(ticketsData.map(t => t.systemName)),
      branches: uniq(ticketsData.map(t => t.branch)),
      departments: uniq(ticketsData.map(t => t.department)),
    };
  }, [ticketsData]);

  // ── THE QUERY ENGINE: search → selection filters → sort ──
  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let rows = ticketsData.filter(t => {
      const matchQ = !q || [
        t.ticket_sl, t.systemName, t.description, t.reportedBy, t.assignedTo,
        t.affectedUser, t.pcName, t.department, t.branch, t.rootCause, t.resolution,
      ].some(v => String(v || "").toLowerCase().includes(q));
      const matchSystem = filterSystem === "all" || t.systemName === filterSystem;
      const matchBranch = filterBranch === "all" || t.branch === filterBranch;
      const matchDept = filterDepartment === "all" || t.department === filterDepartment;
      const matchRisk = filterRisk === "all" || t.priority === filterRisk;
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      return matchQ && matchSystem && matchBranch && matchDept && matchRisk && matchStatus;
    });

    const accessor = SORT_ACCESSORS[sortBy] || SORT_ACCESSORS.createdAt;
    rows = [...rows].sort((a, b) => {
      const va = accessor(a); const vb = accessor(b);
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [ticketsData, searchTerm, filterSystem, filterBranch, filterDepartment, filterRisk, filterStatus, sortBy, sortDir]);

  // ── Summary always reflects the CURRENT filtered view ──
  const summary = useMemo(() => {
    const rows = filteredTickets;
    const total = rows.length;
    const resolved = rows.filter(t => t.status === "resolved").length;
    const open = rows.filter(t => t.status === "open").length;
    const inProgress = rows.filter(t => t.status === "in-progress").length;
    const high = rows.filter(t => t.priority === "HIGH").length;
    const medium = rows.filter(t => t.priority === "MEDIUM").length;
    const low = total - high - medium;
    const totalResp = rows.reduce((s, t) => s + (parseInt(t.responseTime) || 0), 0);
    const resolvedRows = rows.filter(t => t.status === "resolved" && t.resolutionTime !== "Pending");
    const totalReso = resolvedRows.reduce((s, t) => s + (parseInt(t.resolutionTime) || 0), 0);
    return {
      total, resolved, open, inProgress, high, medium, low,
      avgResponse: total ? (totalResp / total).toFixed(1) : 0,
      avgResolution: resolvedRows.length ? (totalReso / resolvedRows.length).toFixed(1) : 0,
      resolutionRate: total ? ((resolved / total) * 100).toFixed(1) : 0,
    };
  }, [filteredTickets]);

  // ── Pagination on the filtered set ──
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const pagedTickets = useMemo(
    () => filteredTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTickets, page]
  );
  useEffect(() => { setPage(1); }, [searchTerm, filterSystem, filterBranch, filterDepartment, filterRisk, filterStatus]);

  const activeFilters = [
    filterSystem !== "all" && { label: `System: ${filterSystem}`, clear: () => setFilterSystem("all") },
    filterBranch !== "all" && { label: `Branch: ${filterBranch}`, clear: () => setFilterBranch("all") },
    filterDepartment !== "all" && { label: `Dept: ${filterDepartment}`, clear: () => setFilterDepartment("all") },
    filterRisk !== "all" && { label: `Risk: ${filterRisk}`, clear: () => setFilterRisk("all") },
    filterStatus !== "all" && { label: `Status: ${STATUS_CFG[filterStatus]?.label || filterStatus}`, clear: () => setFilterStatus("all") },
    searchTerm && { label: `"${searchTerm}"`, clear: () => setSearchTerm("") },
  ].filter(Boolean);

  const clearAllFilters = () => {
    setSearchTerm(""); setFilterSystem("all"); setFilterBranch("all");
    setFilterDepartment("all"); setFilterRisk("all"); setFilterStatus("all");
  };

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir(key === "createdAt" ? "desc" : "asc"); }
  };

  const SortIcon = ({ col }) => sortBy !== col
    ? <ChevronsUpDown size={11} className="text-gray-600" />
    : sortDir === "asc"
      ? <ChevronUp size={11} className="text-indigo-400" />
      : <ChevronDown size={11} className="text-indigo-400" />;

  const formatDateRange = () => {
    if (!reportData) return "";
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} – ${new Date(customEndDate).toLocaleDateString()}`;
    }
    return `${new Date(reportData.dateRange.start).toLocaleDateString()} – ${new Date(reportData.dateRange.end).toLocaleDateString()}`;
  };

  // ── Excel serial / string date → YYYY-MM-DD ──
  const convertExcelDate = (excelDate) => {
    if (!excelDate) return null;
    if (typeof excelDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(excelDate)) return excelDate;
    if (typeof excelDate === "number") {
      const d = new Date((excelDate - 25569) * 86400 * 1000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
    }
    return null;
  };

  // ── Upload: parse → validate → preview ──
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadProgress(true);
    setUploadResults(null);
    setValidationResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const formattedData = jsonData.map((row, idx) => ({
          id: idx + 1,
          ticket_sl: row.ticket_sl || row["S\\L"] || null,
          date: convertExcelDate(row.date || row.Date || null),
          month: row.month || row.Month || null,
          reporter_name: row.reporter_name || row["Reported By"] || row.reporterName || null,
          assigned_to_name: row.assigned_to_name || row["Assigned To"] || row.assignedToName || null,
          system_name: row.system_name || row["System Name"] || row.systemName || null,
          problem_details: row.problem_details || row["Problem Details"] || row.problemDetails || null,
          department: row.department || row.Department || null,
          branch: row.branch || row.Branch || null,
          risk_label: row.risk_label || row["Risk Label"] || row.riskLabel || "MEDIUM",
          affected_user: row.affected_user || row["Affected user"] || row.affectedUser || null,
          pc_name: row.pc_name || row["PC Name"] || row.pcName || null,
          down_time: convertExcelDate(row.down_time || row["Down Time"] || row.downTime || null),
          up_time: convertExcelDate(row.up_time || row["UP Time"] || row.upTime || null),
          resolution: row.resolution || row.Resulation || null,
          remarks: row.remarks || row.Remarks || null,
          status: row.status || row.Status || "pending",
        }));

        setPreviewData(formattedData);
        const validateResult = await validateBulkTickets(formattedData, token);
        setValidationResults(validateResult);
        setShowUploadModal(false);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to parse file: ${error.message}`);
      } finally {
        setUploadProgress(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Confirm and execute import after preview ──
  const confirmImport = async () => {
    setUploadProgress(true);
    setShowPreviewModal(false);
    try {
      const importData = previewData.map(({ id, ...rest }) => rest);
      const importResult = await bulkImportTickets(importData, token);
      setUploadResults(importResult);
      if (importResult.summary?.successful > 0) {
        if (dateRange === "custom" && customStartDate && customEndDate) {
          fetchReportData("custom", customStartDate, customEndDate);
        } else if (dateRange !== "custom") {
          fetchReportData(dateRange);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(`Import failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadProgress(false);
      setTimeout(() => { setPreviewData([]); setValidationResults(null); }, 100);
    }
  };

  // ── Exports — always operate on the FILTERED + SORTED view ──
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 100);
    doc.text("IT Support Audit Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
    doc.text(`Report Period: ${formatDateRange()}`, pageWidth / 2, 37, { align: "center" });
    doc.text(`Generated by: ${user?.name} (${user?.role})`, pageWidth / 2, 44, { align: "center" });
    const filterDesc = activeFilters.length ? activeFilters.map(f => f.label).join("  |  ") : "None (all records)";
    doc.text(`Applied Filters: ${filterDesc.substring(0, 90)}`, pageWidth / 2, 51, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Executive Summary", 14, 70);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const summaryData = [
      ["Total Tickets", summary.total],
      ["Resolved", summary.resolved],
      ["Open", summary.open],
      ["In Progress", summary.inProgress],
      ["Resolution Rate", `${summary.resolutionRate}%`],
      ["Avg Response Time", `${summary.avgResponse}h`],
      ["Avg Resolution Time", `${summary.avgResolution}h`],
    ];
    summaryData.forEach((item, i) => {
      doc.text(String(item[0]), 14, 78 + i * 7);
      doc.text(String(item[1]), 80, 78 + i * 7);
    });

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Risk Distribution", 14, 138);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    [["High", summary.high], ["Medium", summary.medium], ["Low", summary.low]].forEach((item, i) => {
      doc.text(String(item[0]), 14, 148 + i * 7);
      doc.text(String(item[1]), 80, 148 + i * 7);
    });

    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Detailed Ticket List", 14, 20);

    doc.autoTable({
      head: [["SL No", "System", "Department", "Branch", "Status", "Risk", "Created", "Resp."]],
      body: filteredTickets.map(t => [
        t.ticket_sl || t.id,
        (t.systemName || "").substring(0, 24),
        (t.department || "—").substring(0, 16),
        (t.branch || "—").substring(0, 16),
        t.status,
        t.priority,
        new Date(t.createdAt).toLocaleDateString(),
        t.responseTime,
      ]),
      startY: 30,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [40, 40, 100], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`audit_report_${dateRange}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ["Ticket SL", "System", "Status", "Risk", "Department", "Branch", "Created Date", "Resolved Date", "Response Time", "Resolution Time", "Assigned To", "Reported By"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filteredTickets.map(t => [
      t.ticket_sl || t.id, t.systemName, t.status, t.priority,
      t.department || "N/A", t.branch || "N/A",
      new Date(t.createdAt).toLocaleString(),
      t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : "Not resolved",
      t.responseTime, t.resolutionTime, t.assignedTo, t.reportedBy,
    ].map(esc));
    const csvContent = [headers.map(esc), ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `audit_report_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTickets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, `audit_report_${dateRange}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans py-6 px-4 md:px-6">
      <div className="max-w-9xl mx-auto space-y-4">

        {/* ── Header ── */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-5">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1.5">
                  <Calendar size={11} /> {formatDateRange() || "Select a period"} ·
                  <span className="font-semibold text-gray-300">{filteredTickets.length}</span> of {ticketsData.length} tickets
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-violet-950/40">
                <Upload size={14} /> Upload Data
              </button>
              <button onClick={exportToPDF} disabled={filteredTickets.length === 0}
                className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-red-950/40">
                <FileDown size={14} /> PDF
              </button>
              <button onClick={exportToCSV} disabled={filteredTickets.length === 0}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-emerald-950/40">
                <Download size={14} /> CSV
              </button>
              <button onClick={exportToExcel} disabled={filteredTickets.length === 0}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-indigo-950/40">
                <FileSpreadsheet size={14} /> Excel
              </button>
            </div>
          </div>
        </div>

        {/* ── Time frame ── */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Period</span>
            <div className="flex flex-wrap items-center gap-0.5 bg-gray-700/60 border border-gray-600 rounded-xl p-1">
              {TIME_FRAMES.map(tf => (
                <button key={tf.value}
                  onClick={() => { setDateRange(tf.value); setShowCustomPicker(tf.value === "custom"); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateRange === tf.value ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
                  {tf.label}
                </button>
              ))}
            </div>
            {loading && <RefreshCw size={14} className="text-indigo-400 animate-spin ml-2" />}
          </div>

          {showCustomPicker && (
            <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className={selCls} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className={selCls} />
              </div>
              <button onClick={() => { if (customStartDate && customEndDate) fetchReportData("custom", customStartDate, customEndDate); }}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition text-sm font-semibold">
                Apply Range
              </button>
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center items-center py-24"><Spinner /></div>
        )}

        {!loading && reportData && (
          <>
            {/* ── Summary cards (live, reflect current filters) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
              <MiniStat label="Total" value={summary.total} color="indigo" Icon={FileText} />
              <MiniStat label="Open" value={summary.open} color="red" Icon={AlertCircle} />
              <MiniStat label="In Progress" value={summary.inProgress} color="amber" Icon={Activity} />
              <MiniStat label="Resolved" value={summary.resolved} color="emerald" Icon={CheckCircle} />
              <MiniStat label="Resolution" value={`${summary.resolutionRate}%`} color="emerald" Icon={TrendingUp} />
              <MiniStat label="High Risk" value={summary.high} color="orange" Icon={AlertTriangle} />
              <MiniStat label="Avg Response" value={`${summary.avgResponse}h`} color="cyan" Icon={Clock} />
              <MiniStat label="Avg Resolution" value={`${summary.avgResolution}h`} color="violet" Icon={Clock} />
            </div>

            {/* ── Distributions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 bg-indigo-500/20 rounded-lg flex items-center justify-center"><Activity size={13} className="text-indigo-400" /></div>
                  <h2 className="font-bold text-gray-100 text-sm">Status Distribution</h2>
                  <span className="ml-auto text-[11px] text-gray-500">{summary.total} tickets in view</span>
                </div>
                <div className="space-y-3">
                  <DistBar label="Open" value={summary.open} total={summary.total} barCls="bg-gradient-to-r from-red-600 to-red-400" />
                  <DistBar label="In Progress" value={summary.inProgress} total={summary.total} barCls="bg-gradient-to-r from-amber-600 to-amber-400" />
                  <DistBar label="Resolved" value={summary.resolved} total={summary.total} barCls="bg-gradient-to-r from-emerald-600 to-emerald-400" />
                </div>
              </div>
              <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 bg-orange-500/20 rounded-lg flex items-center justify-center"><AlertTriangle size={13} className="text-orange-400" /></div>
                  <h2 className="font-bold text-gray-100 text-sm">Risk Distribution</h2>
                  <span className="ml-auto text-[11px] text-gray-500">{summary.high} high risk</span>
                </div>
                <div className="space-y-3">
                  <DistBar label="High" value={summary.high} total={summary.total} barCls="bg-gradient-to-r from-red-600 to-red-400" />
                  <DistBar label="Medium" value={summary.medium} total={summary.total} barCls="bg-gradient-to-r from-orange-600 to-orange-400" />
                  <DistBar label="Low" value={summary.low} total={summary.total} barCls="bg-gradient-to-r from-blue-600 to-blue-400" />
                </div>
              </div>
            </div>

            {/* ── Query bar: search + selection filters ── */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search SL, system, problem, reporter, assignee, PC, branch…"
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-600 bg-gray-700/60 text-gray-100 placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200"><X size={13} /></button>
                  )}
                </div>

                <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} className={selCls}>
                  <option value="all">All Systems</option>
                  {options.systems.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className={selCls}>
                  <option value="all">All Departments</option>
                  {options.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className={selCls}>
                  <option value="all">All Branches</option>
                  {options.branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className={selCls}>
                  <option value="all">All Risk</option>
                  <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selCls}>
                  <option value="all">All Status</option>
                  <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option>
                </select>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-700">
                  <Filter size={12} className="text-indigo-400" />
                  {activeFilters.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-lg text-[11px] font-semibold">
                      {f.label}
                      <button onClick={f.clear} className="hover:text-white"><X size={10} /></button>
                    </span>
                  ))}
                  <button onClick={clearAllFilters} className="text-[11px] text-gray-400 hover:text-gray-200 font-semibold ml-1 underline">Clear all</button>
                  <span className="ml-auto text-[11px] text-gray-500">{filteredTickets.length} match{filteredTickets.length === 1 ? "" : "es"}</span>
                </div>
              )}
            </div>

            {/* ── Tickets table (sortable) ── */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700/40 border-b border-gray-700">
                      {[
                        ["ticket_sl", "SL No"], ["createdAt", "Date"], ["system", "System"],
                        ["department", "Department"], ["branch", "Branch"], ["reportedBy", "Reported By"],
                        ["assignedTo", "Assigned To"], ["priority", "Risk"], ["status", "Status"],
                        ["responseTime", "Resp."], ["resolutionTime", "Resol."],
                      ].map(([key, label]) => (
                        <th key={key} onClick={() => toggleSort(key)}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-200 transition">
                          <span className="inline-flex items-center gap-1">{label}<SortIcon col={key} /></span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/70">
                    {pagedTickets.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-14 text-center">
                          <Database size={28} className="mx-auto text-gray-600 mb-2" />
                          <p className="text-gray-500 text-sm">No tickets match the current filters</p>
                          {activeFilters.length > 0 && (
                            <button onClick={clearAllFilters} className="mt-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold underline">Clear filters</button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      pagedTickets.map(t => {
                        const risk = RISK_CFG[t.priority] || RISK_CFG.MEDIUM;
                        const status = STATUS_CFG[t.status] || STATUS_CFG.open;
                        return (
                          <tr key={t.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{t.ticket_sl || t.id}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Server size={11} className="text-gray-500 flex-shrink-0" />
                                <span className="text-gray-200 font-medium text-xs whitespace-nowrap max-w-[160px] truncate" title={t.systemName}>{t.systemName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{t.department || <span className="text-gray-600">—</span>}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{t.branch || <span className="text-gray-600">—</span>}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap max-w-[140px] truncate" title={t.reportedBy}>{t.reportedBy}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap max-w-[140px] truncate" title={t.assignedTo}>
                              {t.assignedTo === "Unassigned" ? <span className="text-gray-600 italic">Unassigned</span> : t.assignedTo}
                            </td>
                            <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${risk.color}`}>{risk.label}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                                <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">{status.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{t.responseTime}</td>
                            <td className="px-4 py-3 text-xs">
                              {t.resolutionTime === "Pending"
                                ? <span className="text-amber-400 font-semibold">Pending</span>
                                : <span className="text-gray-400">{t.resolutionTime}</span>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTickets.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 bg-gray-800/80">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-300">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTickets.length)}</span> of <span className="font-semibold text-gray-300">{filteredTickets.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"><ChevronLeft size={15} /></button>
                    <span className="text-xs font-semibold text-gray-300">Page {page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"><ChevronRight size={15} /></button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Import results ── */}
            {uploadResults && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-700 flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-400" />
                  <h3 className="font-bold text-gray-100 text-sm">Import Results</h3>
                  <button onClick={() => setUploadResults(null)} className="ml-auto p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition"><X size={14} /></button>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{uploadResults.summary?.successful || 0}</p>
                      <p className="text-xs text-emerald-300/80 mt-0.5">Successful</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-bold text-red-400">{uploadResults.summary?.failed || 0}</p>
                      <p className="text-xs text-red-300/80 mt-0.5">Failed</p>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-bold text-indigo-400">{uploadResults.summary?.success_rate || "0"}%</p>
                      <p className="text-xs text-indigo-300/80 mt-0.5">Success Rate</p>
                    </div>
                  </div>
                  {uploadResults.failed?.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-semibold text-red-400 hover:text-red-300">
                        View Failed Records ({uploadResults.failed.length})
                      </summary>
                      <div className="mt-2 max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar">
                        {uploadResults.failed.map((fail, idx) => (
                          <div key={idx} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs">
                            <p className="text-gray-300"><span className="font-bold">Ticket:</span> {fail.ticket_sl}</p>
                            <p className="text-red-300"><span className="font-bold">Error:</span> {fail.error}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════ MODALS ═══════════ */}

        {/* Upload modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-violet-500/20 rounded-xl flex items-center justify-center"><Upload size={16} className="text-violet-400" /></div>
                  <h3 className="text-lg font-bold text-gray-100">Upload Previous Data</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition"><X size={16} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Upload an Excel or CSV file containing previous ticket data. You'll be able to preview and validate everything before importing.</p>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload}
                className="w-full p-2.5 border border-gray-600 bg-gray-700/60 text-gray-300 rounded-xl text-sm mb-3 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-indigo-500" />
              <div className="text-xs text-gray-500 bg-gray-700/40 border border-gray-600/60 rounded-xl p-3 mb-4 flex gap-2">
                <Info size={13} className="flex-shrink-0 mt-0.5 text-indigo-400" />
                <div>
                  <p>Supported formats: .xlsx, .xls, .csv</p>
                  <p className="mt-0.5">Expected columns: ticket_sl, date, system_name, problem_details, department, branch, risk_label, status…</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)}
                className="w-full border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">Cancel</button>
            </div>
          </div>
        )}

        {/* Preview modal — review before import */}
        {showPreviewModal && previewData.length > 0 && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-[95vw] w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-indigo-500/20 rounded-xl flex items-center justify-center"><Eye size={16} className="text-indigo-400" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Preview Data Before Import</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Only records with valid Problem Details will be imported.</p>
                  </div>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition"><X size={16} /></button>
              </div>

              <div className="p-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                  {[
                    ["Total Records", previewData.length, "bg-indigo-500/10 border-indigo-500/30", "text-indigo-400", "text-indigo-300/80"],
                    ["Valid Records", previewData.filter(r => r.problem_details && r.problem_details.trim()).length, "bg-emerald-500/10 border-emerald-500/30", "text-emerald-400", "text-emerald-300/80"],
                    ["Invalid Records", previewData.filter(r => !r.problem_details || !r.problem_details.trim()).length, "bg-red-500/10 border-red-500/30", "text-red-400", "text-red-300/80"],
                    ["Validated", validationResults?.summary?.validCount || 0, "bg-violet-500/10 border-violet-500/30", "text-violet-400", "text-violet-300/80"],
                    ["With Ticket SL", previewData.filter(r => r.ticket_sl).length, "bg-amber-500/10 border-amber-500/30", "text-amber-400", "text-amber-300/80"],
                  ].map(([l, v, box, num, lbl]) => (
                    <div key={l} className={`${box} border rounded-xl p-3 text-center`}>
                      <p className={`text-xl font-bold ${num}`}>{v}</p>
                      <p className={`text-[11px] ${lbl} mt-0.5`}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Data preview table */}
                <div className="border border-gray-700 rounded-xl overflow-hidden mb-5">
                  <div className="overflow-x-auto max-h-[440px] custom-scrollbar">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-700 border-b border-gray-600">
                          {["#", "Ticket SL", "Date", "Reporter", "Assigned To", "System", "Problem Details", "Department", "Branch", "Risk", "Affected User", "PC Name", "Down Time", "Up Time", "Status"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/70">
                        {previewData.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className={!row.problem_details ? "bg-red-500/10" : "hover:bg-gray-700/30"}>
                            <td className="px-3 py-2.5 text-xs text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-2.5 text-xs font-mono text-gray-300">{row.ticket_sl || <span className="text-gray-600 italic">Auto</span>}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.date || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.reporter_name || <span className="text-gray-600 italic">Will use admin</span>}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.assigned_to_name || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.system_name || "—"}</td>
                            <td className="px-3 py-2.5 text-xs max-w-xs truncate">
                              {row.problem_details
                                ? <span className="text-emerald-300" title={row.problem_details}>{row.problem_details.substring(0, 40)}…</span>
                                : <span className="text-red-400 font-bold">MISSING</span>}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.department || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.branch || "—"}</td>
                            <td className="px-3 py-2.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${(RISK_CFG[row.risk_label] || RISK_CFG.MEDIUM).color}`}>{row.risk_label || "MEDIUM"}</span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.affected_user || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.pc_name || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.down_time || "—"}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{row.up_time || "—"}</td>
                            <td className="px-3 py-2.5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${(STATUS_CFG[row.status] || STATUS_CFG.pending).color}`}>{row.status || "pending"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 50 && (
                      <div className="p-3 text-center text-xs text-gray-500 bg-gray-700/40">+ {previewData.length - 50} more records will also be processed</div>
                    )}
                  </div>
                </div>

                {/* Validation warnings */}
                {validationResults?.invalid?.length > 0 && (
                  <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <h4 className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5"><AlertTriangle size={14} /> Validation Warnings</h4>
                    <p className="text-xs text-amber-200/80 mb-2">{validationResults.summary.invalidCount} records have issues and will be skipped:</p>
                    <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5">
                      {validationResults.invalid.slice(0, 10).map((err, idx) => (
                        <p key={idx} className="text-xs text-amber-300/90">• Row {err.row}: {err.errors.join(", ")}</p>
                      ))}
                      {validationResults.invalid.length > 10 && (
                        <p className="text-xs text-amber-300/70 mt-1">+ {validationResults.invalid.length - 10} more issues</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={confirmImport}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Confirm Import ({previewData.filter(r => r.problem_details).length} records)
                  </button>
                  <button onClick={() => setShowPreviewModal(false)}
                    className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {uploadProgress && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
              <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-200 font-semibold text-sm">Processing upload…</p>
              <p className="text-xs text-gray-500 mt-1">Please wait</p>
            </div>
          </div>
        )}

        {/* ── Scrollbar / select styling ── */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 9999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
          select option { background-color: #1f2937; color: #f3f4f6; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        `}</style>
      </div>
    </div>
  );
}
