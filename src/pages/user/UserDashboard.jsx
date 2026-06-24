import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Edit, Trash2, Search, X, CheckCircle, AlertCircle,
  Clock, Server, User, FileText, Plus, Eye,
  ChevronLeft, ChevronRight, Users, Ticket, Database, MapPin, Layout,
  Shield, TrendingUp, TrendingDown, Activity, Bell, Home, AlertTriangle,
  Megaphone, Send, RefreshCw, Info, ToggleLeft, ToggleRight, LogOut, Target,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  getUsers, createUser, updateUser, deleteUser,
  getDashboardStats,
  getSystems, createSystem, updateSystem, deleteSystem,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getBranches, createBranch, updateBranch, deleteBranch,
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getPaginatedTickets, updateTicket, deleteTicket,
  getTopSystems, getDownAtms,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getAuditLogs, getAuditSummary, getRecentActivities, getUserActivityStats,
} from "../../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "users", label: "Users", icon: Users },
  { id: "systems", label: "Systems", icon: Database },
  { id: "departments", label: "Departments", icon: Layout },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "templates", label: "Templates", icon: FileText },
];

const STATUS_CFG = {
  open: { color: "bg-red-500/20 text-red-300", dot: "bg-red-500", label: "Open", icon: AlertCircle },
  "in-progress": { color: "bg-amber-500/20 text-amber-300", dot: "bg-amber-500", label: "In Progress", icon: Activity },
  resolved: { color: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-500", label: "Resolved", icon: CheckCircle },
};

const RISK_CFG = {
  HIGH: { color: "bg-red-500/20 text-red-300", label: "High" },
  MEDIUM: { color: "bg-orange-500/20 text-orange-300", label: "Medium" },
  LOW: { color: "bg-blue-500/20 text-blue-300", label: "Low" },
  high: { color: "bg-red-500/20 text-red-300", label: "High" },
  medium: { color: "bg-orange-500/20 text-orange-300", label: "Medium" },
  low: { color: "bg-blue-500/20 text-blue-300", label: "Low" },
};

const PRIORITY_CFG = {
  urgent: { color: "bg-red-500/20 text-red-300", label: "Urgent" },
  high: { color: "bg-orange-500/20 text-orange-300", label: "High" },
  normal: { color: "bg-green-500/20 text-green-300", label: "Normal" },
  low: { color: "bg-blue-500/20 text-blue-300", label: "Low" },
};

const DATE_FILTERS = [
  { l: "All", v: "all" },
  { l: "Today", v: "today" },
  { l: "Yesterday", v: "yesterday" },
  { l: "This Week", v: "week" },
  { l: "This Month", v: "month" },
  { l: "This Quarter", v: "quarter" },
  { l: "This Year", v: "year" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relTime = (str) => {
  if (!str) return { text: "Not set", bg: "bg-gray-700", tc: "text-gray-400" };
  const d = new Date(str);
  if (isNaN(d)) return { text: "Invalid", bg: "bg-gray-700", tc: "text-gray-400" };
  const diff = Math.floor((Date.now() - d) / 60000);
  const text =
    diff < 0 ? "Just now" :
      diff < 1 ? "Just now" :
        diff < 60 ? `${diff}m ago` :
          diff < 1440 ? `${Math.floor(diff / 60)}h ago` :
            `${Math.floor(diff / 1440)}d ago`;
  const bg = diff <= 5 ? "bg-emerald-500/20" : diff <= 30 ? "bg-amber-500/20" : "bg-red-500/20";
  const tc = diff <= 5 ? "text-emerald-400" : diff <= 30 ? "text-amber-400" : "text-red-400";
  return { text, bg, tc };
};

// Helper function to format date in Bangladesh timezone (UTC+6)
const formatLocalTime = (str) => {
  if (!str) return '—';
  const localStr = str.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
  const d = new Date(localStr);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '-';
  }
};

// Calculate ATM down duration — tries multiple field names
const atmDuration = (atm) => {
  const raw = atm.down_time || atm.down_since || atm.created_at || atm.downTime;
  if (!raw) return "Unknown";
  const d = new Date(raw);
  if (isNaN(d)) return "Unknown";
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Spinner = ({ color = "indigo" }) => (
  <div className={`h-8 w-8 border-4 border-${color}-700/40 border-t-${color}-500 rounded-full animate-spin mx-auto`} />
);

const EmptyState = ({ label }) => (
  <div className="py-16 text-center">
    <div className="h-14 w-14 bg-gray-700/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <FileText size={24} className="text-gray-500" />
    </div>
    <p className="text-gray-400 font-medium">No {label} found</p>
    <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filters</p>
  </div>
);

const PaginationBar = ({ current, total, count, pageSize, onPrev, onNext }) => {
  const from = count === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, count);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-700 bg-gray-800/60">
      <p className="text-xs text-gray-400">
        {count === 0 ? "No results" : `Showing ${from}–${to} of ${count}`}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={onPrev} disabled={current === 1}
          className="p-1.5 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs font-semibold text-gray-300 px-2">
          {current} / {total || 1}
        </span>
        <button onClick={onNext} disabled={current >= total}
          className="p-1.5 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

// ── Stat card with comparison badge (↑ 12% from last month) ──────────────────
const STAT_COLORS = {
  indigo: { iconBg: "bg-indigo-500/20", icon: "text-indigo-400", ring: "ring-indigo-500/30", border: "border-indigo-500/50" },
  red: { iconBg: "bg-red-500/20", icon: "text-red-400", ring: "ring-red-500/30", border: "border-red-500/50" },
  amber: { iconBg: "bg-amber-500/20", icon: "text-amber-400", ring: "ring-amber-500/30", border: "border-amber-500/50" },
  emerald: { iconBg: "bg-emerald-500/20", icon: "text-emerald-400", ring: "ring-emerald-500/30", border: "border-emerald-500/50" },
};

const ComparisonBadge = ({ comparison, goodWhenDown = false }) => {
  if (!comparison) return null;
  const up = comparison.isIncrease;
  // For "Open" tickets, a decrease is good (green); for "Resolved", an increase is good
  const positive = goodWhenDown ? !up : up;
  const Arrow = up ? TrendingUp : TrendingDown;
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <span className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md ${positive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
        <Arrow size={11} />
        {comparison.percentage !== null && comparison.percentage !== undefined
          ? `${comparison.percentage}%`
          : comparison.value}
      </span>
      <span className="text-xs text-gray-500">{comparison.label}</span>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
  Icon,
  active,
  onClick,
  comparison,
  goodWhenDown,
}) => {
  const c = STAT_COLORS[color] || STAT_COLORS.indigo;

  return (
    <button
      onClick={onClick}
      className={`
        bg-gray-800
        rounded-xl
        p-3
        border
        text-left
        w-full
        transition-all
        duration-200
        hover:shadow-md
        hover:shadow-black/20
        hover:-translate-y-0.5
        group
        ${active
          ? `${c.border} ring-1 ${c.ring}`
          : "border-gray-700 hover:border-gray-600"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </p>

        <div
          className={`
            h-7 w-7
            ${c.iconBg}
            rounded-lg
            flex items-center justify-center
            group-hover:scale-105
            transition-transform
          `}
        >
          <Icon size={13} className={c.icon} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-white leading-none">
          {value}
        </p>

        {comparison && (
          <ComparisonBadge
            comparison={comparison}
            goodWhenDown={goodWhenDown}
          />
        )}
      </div>
    </button>
  );
};

// ── SLA Achievement circular gauge ────────────────────────────────────────────
const SLACircle = ({ sla }) => {
  const pct = Math.min(100, Math.max(0, parseFloat(sla?.percentage) || 0));
  const C = 2 * Math.PI * 42;

  return (
    <div className="flex items-center gap-2">

      {/* SMALL CIRCLE */}
      <div className="relative h-14 w-14 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#6366f1"
            strokeWidth="10"
            strokeDasharray={`${(pct / 100) * C} ${C}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">
            {pct}%
          </span>
        </div>
      </div>

      {/* TEXT (TIGHT) */}
      <div className="leading-tight">
        <p className="text-[11px] font-semibold text-gray-100">SLA</p>
        <p className="text-[10px] text-gray-500">
          {sla?.met || 0}/{sla?.total || 0}
        </p>
      </div>

    </div>
  );
};
const DonutChart = ({ data, title, subtitle, iconBg, IconEl }) => {
  const renderPercentageLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;

    // keep labels close but readable
    const radius = outerRadius + 8;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#E5E7EB"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}   // 🔼 increased (11 → 12)
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-3 flex flex-col h-[260px]">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-7 w-7 ${iconBg} rounded-md flex items-center justify-center flex-shrink-0`}>
          {IconEl}
        </div>

        <h2 className="font-semibold text-gray-100 text-base truncate">
          {title}
        </h2>

        {subtitle && (
          <span className="ml-auto text-xs text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded-md">
            {subtitle}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          No data
        </div>
      ) : (
        <>
          {/* PIE */}
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                label={renderPercentageLabel}
                labelLine={false}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    stroke="#1f2937"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* LEGEND (slightly bigger) */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-0.5">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">

                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-sm text-gray-400"> {/* 🔼 increased */}
                  {item.name}
                </span>

                <span className="text-sm font-semibold text-white"> {/* 🔼 increased */}
                  {item.value}
                </span>

              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};
// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // ── Entity data ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [systems, setSystems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // ── Ticket pagination (server-side) ──────────────────────────────────────────
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 50;

  // ── Dashboard stats from backend ─────────────────────────────────────────────
  const [dashStats, setDashStats] = useState({
    total: 0, open: 0, progress: 0, resolved: 0,
    highRisk: 0, mediumRisk: 0, lowRisk: 0, activeTotal: 0,
  });
  const [statusChart, setStatusChart] = useState([]);
  const [riskChart, setRiskChart] = useState([]);
  // ✅ NEW: comparisons + SLA achievement from the enhanced /stats endpoint
  const [comparisons, setComparisons] = useState(null);
  const [slaAchievement, setSlaAchievement] = useState(null);

  // ── Overview extras ──────────────────────────────────────────────────────────
  const [topSystems, setTopSystems] = useState([]);
  const [topStats, setTopStats] = useState({ totalTickets: 0, uniqueSystems: 0, topSystemName: "", topSystemPercentage: 0 });
  const [downAtms, setDownAtms] = useState([]);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [loadingAtms, setLoadingAtms] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedCard, setSelectedCard] = useState(null);

  // ── Modals ────────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  const token = localStorage.getItem("cbcToken");

  // ── Audit Trail ────────────────────────────────────────────────────────────────

  // ✅ RESTORED: state for the View Details modal
  const [selectedAuditDetails, setSelectedAuditDetails] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);




  // ── Notification helper ───────────────────────────────────────────────────────
  const notify = useCallback((msg, type = "success") => {
    const id = Date.now();
    setNotifications(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3000);
  }, []);




  // ── Fetch paginated tickets (server-side) ────────────────────────────────────
  const fetchTickets = useCallback(async (page = 1) => {
    if (!token) return;
    try {
      const data = await getPaginatedTickets(token, {
        page,
        pageSize: PAGE_SIZE,
        status: filterStatus !== "all" ? filterStatus : "",
        search: searchTerm,
        dateFilter,
        sortBy: "date",
      });
      setTickets(data.tickets || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (e) { notify("Failed to load tickets", "error"); }
  }, [token, filterStatus, searchTerm, dateFilter, notify]);

  // ── Fetch dashboard stats from backend (✅ now reads comparisons + SLA) ───────
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getDashboardStats(token, dateFilter);
      if (data?.stats) {
        setDashStats(data.stats);
        setStatusChart(data.statusChartData || []);
        setRiskChart(data.riskChartData || []);
        setComparisons(data.comparisons || null);        // ✅ NEW
        setSlaAchievement(data.slaAchievement || null);  // ✅ NEW
      }
    } catch (e) { console.error("Stats fetch failed", e); }
  }, [token, dateFilter]);

  // ── Fetch top systems ─────────────────────────────────────────────────────────
  const fetchTopSystems = useCallback(async () => {
    if (!token) return;
    setLoadingSystems(true);
    try {
      const res = await getTopSystems(token, dateFilter);
      if (res?.success) {
        setTopSystems(res.data?.systems || []);
        setTopStats(res.data?.stats || {});
      } else if (Array.isArray(res)) {
        setTopSystems(res);
        const tot = res.reduce((s, x) => s + (x.ticket_count || 0), 0);
        setTopStats({ totalTickets: tot, uniqueSystems: res.length, topSystemName: res[0]?.system_name || "", topSystemPercentage: tot > 0 ? Math.round(((res[0]?.ticket_count || 0) / tot) * 100) : 0 });
      }
    } catch (e) { console.error("Top systems failed", e); }
    finally { setLoadingSystems(false); }
  }, [token, dateFilter]);

  // ── Fetch down ATMs ───────────────────────────────────────────────────────────
  const fetchDownAtms = useCallback(async () => {
    if (!token) return;
    setLoadingAtms(true);
    try {
      const raw = await getDownAtms(token);
      const arr = Array.isArray(raw) ? raw : [];
      setDownAtms(arr.map(a => ({ ...a, _duration: a.down_time_duration || atmDuration(a) })));
    } catch (e) { console.error("Down ATMs failed", e); }
    finally { setLoadingAtms(false); }
  }, [token]);

  // ── Fetch non-ticket entity data ─────────────────────────────────────────────
  const fetchEntities = useCallback(async () => {
    if (!token) return;
    try {
      const [u, sys, dep, bra, tpl, ann] = await Promise.all([
        getUsers(token), getSystems(token), getDepartments(token),
        getBranches(token), getTemplates(token), getAnnouncements(token),
      ]);
      setUsers(Array.isArray(u) ? u : u?.data || []);
      setSystems(Array.isArray(sys) ? sys : sys?.data || []);
      setDepartments(Array.isArray(dep) ? dep : dep?.data || []);
      setBranches(Array.isArray(bra) ? bra : bra?.data || []);
      setTemplates(Array.isArray(tpl) ? tpl : tpl?.templates || tpl?.data || []);
      const annList = Array.isArray(ann) ? ann : ann?.data || [];
      setAnnouncements(annList);
    } catch (e) { notify("Failed to load data", "error"); }
  }, [token, notify]);

  // ── Initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { notify("Not authenticated", "error"); return; }
    (async () => {
      setLoading(true);
      await Promise.all([fetchEntities(), fetchStats(), fetchTickets(1), fetchTopSystems(), fetchDownAtms()]);
      setLoading(false);
    })();
  }, [token]);

  // Re-fetch tickets when filters/page change
  useEffect(() => {
    setCurrentPage(1);
    fetchTickets(1);
  }, [filterStatus, searchTerm, dateFilter]);

  useEffect(() => { fetchTickets(currentPage); }, [currentPage]);

  // Re-fetch stats & top systems when date filter changes
  useEffect(() => { fetchStats(); fetchTopSystems(); }, [dateFilter]);

  // ── Local search filters (non-ticket tabs) ────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return {
      users: users.filter(u => [u.name, u.email].some(v => v?.toLowerCase().includes(q))),
      systems: systems.filter(s => s.name?.toLowerCase().includes(q)),
      departments: departments.filter(d => d.name?.toLowerCase().includes(q)),
      branches: branches.filter(b => b.name?.toLowerCase().includes(q)),
      templates: templates.filter(t => [t.name, t.category].some(v => v?.toLowerCase().includes(q))),
      announcements: announcements.filter(a => [a.title, a.content].some(v => v?.toLowerCase().includes(q))),
    };
  }, [users, systems, departments, branches, templates, announcements, searchTerm]);

  // ── Derived: Critical Operations Monitor values ───────────────────────────────
  const criticalOps = useMemo(() => ({
    atmOffline: downAtms.length,
    highRisk: dashStats.highRisk || 0,
    slaBreaches: slaAchievement?.breaches ?? Math.max(0, (slaAchievement?.total || 0) - (slaAchievement?.met || 0)),
    healthySystems: Math.max(0, (systems.length || 0) - (topSystems.filter(s => (s.ticket_count || 0) > 0).length || 0)),
  }), [downAtms, dashStats.highRisk, slaAchievement, systems, topSystems]);

  // ── CRUD helpers ───────────────────────────────────────────────────────────────
  const closeModal = () => { setShowModal(false); setEditingItem(null); setModalType(""); };
  const openModal = (type, item = null) => { setModalType(type); setEditingItem(item); setShowModal(true); };
  const reload = () => { fetchEntities(); fetchStats(); fetchTickets(currentPage); };

  const handleCardClick = (status) => {
    setSelectedCard(status);
    setFilterStatus(status);
    if (activeTab !== "tickets") setActiveTab("tickets");
  };

  // Generic form save
  const saveSimple = async (e, updateFn, createFn, label) => {
    e.preventDefault();
    const name = new FormData(e.target).get("name");
    try {
      editingItem ? await updateFn(editingItem.id, { name }, token) : await createFn(name, token);
      notify(`${label} ${editingItem ? "updated" : "created"}`);
      closeModal(); fetchEntities();
    } catch (err) { notify(err.message, "error"); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const d = {
      email: fd.get("email"),
      name: fd.get("name"),
      role: fd.get("role"),
      department: fd.get("department"),
      branch: fd.get("branch"),
      employee_id: fd.get("employee_id") || null,
      pabx_extension: fd.get("pabx_extension") || null,
      mobile_number: fd.get("mobile_number") || null
    };
    // NO PASSWORD FIELD - AD handles authentication
    try {
      if (editingItem) {
        await updateUser(editingItem.id, d, token);
        notify(`User ${editingItem.name} updated successfully`);
      } else {
        await createUser(d, token);
        notify("User created successfully");
      }
      closeModal();
      fetchEntities();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const d = { id: editingItem ? editingItem.id : fd.get("id"), name: fd.get("name"), category: fd.get("category"), icon_name: fd.get("icon_name"), system_name: fd.get("system_name"), department: fd.get("department"), problem_details: fd.get("problem_details"), risk_label: fd.get("risk_label"), affected_user: fd.get("affected_user") };
    try {
      editingItem ? await updateTemplate(editingItem.id, d, token) : await createTemplate(d, token);
      notify(`Template ${editingItem ? "updated" : "created"}`);
      closeModal(); fetchEntities();
    } catch (err) { notify(err.message, "error"); }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const d = { title: fd.get("title"), content: fd.get("content"), priority: fd.get("priority"), expires_at: fd.get("expires_at") || null, is_active: true };
    try {
      editingItem ? await updateAnnouncement(editingItem.id, d, token) : await createAnnouncement(d, token);
      notify(`Announcement ${editingItem ? "updated" : "published"}`);
      closeModal(); fetchEntities();
    } catch (err) { notify(err.message, "error"); }
  };

  // ── CHECK PERMISSION: Can edit ticket? ──────────────────────────────────────
  const canEditTicket = useCallback((ticket) => {
    if (!user || !ticket) return false;
    // User can edit if they created the ticket OR they are assigned to it
    const isCreator = ticket.reportedByEmail === user.email || ticket.reportedBy === user.email;
    const isAssigned = ticket.assigned_to_email === user.email;
    return isCreator || isAssigned;
  }, [user]);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    // Double-check permission before allowing update
    if (!canEditTicket(editingItem)) {
      notify("You don't have permission to edit this ticket", "error");
      closeModal();
      return;
    }
    const fd = new FormData(e.target);
    const updates = { status: fd.get("status"), assigned_to_email: fd.get("assigned_to_email") || null, remarks_by_admin: fd.get("remarks_by_admin"), system_name: fd.get("system_name"), department: fd.get("department"), branch: fd.get("branch"), affected_user: fd.get("affected_user"), risk_label: fd.get("risk_label"), problem_details: fd.get("problem_details"), root_cause: fd.get("root_cause"), resolution: fd.get("resolution") };
    const dt = fd.get("down_time"); const ut = fd.get("up_time");
    if (dt) updates.down_time = new Date(dt).toISOString();
    if (ut) updates.up_time = new Date(ut).toISOString();
    try {
      await updateTicket(editingItem.id, updates, token);
      notify("Ticket updated"); closeModal(); fetchTickets(currentPage); fetchStats();
    } catch (err) { notify(err.message, "error"); }
  };

  // ── DELETE FUNCTIONS REMOVED ─────────────────────────────────────────────────
  // User cannot delete anything. Delete handlers are now empty or disabled.
  const handleDelete = async () => {
    // No delete functionality for users
    notify("Delete operation is disabled for your role", "error");
    setDeleteConfirm(null);
    setDeleteType(null);
  };

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const inputCls = "w-full border border-gray-600 bg-gray-700/60 text-gray-100 placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";
  const ModalBtns = ({ label }) => (
    <div className="flex gap-3 pt-3">
      <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-500 transition font-semibold text-sm">{editingItem ? "Update" : "Create"} {label}</button>
      <button type="button" onClick={closeModal} className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">Cancel</button>
    </div>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case "user": return (
        <form onSubmit={handleSaveUser} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Basic Information Section */}
          <div className="border-b border-gray-700 pb-3 mb-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" defaultValue={editingItem?.name} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input type="email" name="email" defaultValue={editingItem?.email} required className={inputCls} />
                <p className="text-xs text-gray-500 mt-1">Must match Active Directory email</p>
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="border-b border-gray-700 pb-3 mb-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Employment Information</h4>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Employee ID</label>
                <input type="text" name="employee_id" defaultValue={editingItem?.employee_id || ""}
                  placeholder="e.g., BD06653" className={inputCls} />
                <p className="text-xs text-gray-500 mt-1">Must match Active Directory Employee ID</p>
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select name="role" defaultValue={editingItem?.role || "user"} className={inputCls}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <select name="department" defaultValue={editingItem?.department || ""} className={inputCls}>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Branch</label>
                <select name="branch" defaultValue={editingItem?.branch || ""} className={inputCls}>
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="pb-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Contact Information</h4>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>PABX Extension</label>
                <input type="text" name="pabx_extension" defaultValue={editingItem?.pabx_extension || ""}
                  placeholder="e.g., 1234" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number</label>
                <input type="tel" name="mobile_number" defaultValue={editingItem?.mobile_number || ""}
                  placeholder="e.g., 01XXXXXXXXX" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-gray-700/50 border border-gray-600/60 p-2 rounded-lg mt-2">
            <Info size={12} className="inline mr-1" />
            Authentication is handled by Active Directory. No password needed.
          </div>

          <ModalBtns label="User" />
        </form>
      );
      case "system": return (
        <form onSubmit={e => saveSimple(e, updateSystem, createSystem, "System")} className="space-y-4">
          <div><label className={labelCls}>System Name</label><input type="text" name="name" defaultValue={editingItem?.name} required className={inputCls} /></div>
          <ModalBtns label="System" />
        </form>
      );
      case "department": return (
        <form onSubmit={e => saveSimple(e, updateDepartment, createDepartment, "Department")} className="space-y-4">
          <div><label className={labelCls}>Department Name</label><input type="text" name="name" defaultValue={editingItem?.name} required className={inputCls} /></div>
          <ModalBtns label="Department" />
        </form>
      );
      case "branch": return (
        <form onSubmit={e => saveSimple(e, updateBranch, createBranch, "Branch")} className="space-y-4">
          <div><label className={labelCls}>Branch Name</label><input type="text" name="name" defaultValue={editingItem?.name} required className={inputCls} /></div>
          <ModalBtns label="Branch" />
        </form>
      );
      case "template": return (
        <form onSubmit={handleSaveTemplate} className="space-y-4 max-h-[58vh] overflow-y-auto pr-1 custom-scrollbar">
          {!editingItem && <div><label className={labelCls}>Template ID</label><input type="text" name="id" placeholder="e.g., template-13" required className={inputCls} /></div>}
          {[["Name", "name", editingItem?.name], ["Category", "category", editingItem?.category], ["System Name", "system_name", editingItem?.system_name], ["Department", "department", editingItem?.department], ["Affected User", "affected_user", editingItem?.affected_user]].map(([l, n, d]) => (
            <div key={n}><label className={labelCls}>{l}</label><input type="text" name={n} defaultValue={d} className={inputCls} /></div>
          ))}
          <div><label className={labelCls}>Icon</label>
            <select name="icon_name" defaultValue={editingItem?.icon_name || "Shield"} className={inputCls}>
              {["Shield", "Wifi", "Printer", "Mail", "Database", "Activity", "Monitor", "Server", "CreditCard", "Smartphone", "FileText"].map(v => <option key={v}>{v}</option>)}
            </select></div>
          <div><label className={labelCls}>Problem Details</label><textarea name="problem_details" rows={3} defaultValue={editingItem?.problem_details} className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Risk</label>
            <select name="risk_label" defaultValue={editingItem?.risk_label || "MEDIUM"} className={inputCls}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
          <ModalBtns label="Template" />
        </form>
      );
      case "announcement": return (
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div><label className={labelCls}>Title <span className="text-red-400">*</span></label><input type="text" name="title" defaultValue={editingItem?.title} required className={inputCls} /></div>
          <div><label className={labelCls}>Message <span className="text-red-400">*</span></label><textarea name="content" rows={4} defaultValue={editingItem?.content} required className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Priority</label>
            <select name="priority" defaultValue={editingItem?.priority || "normal"} className={inputCls}>
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          <div><label className={labelCls}>Expires At (Optional)</label>
            <input type="datetime-local" name="expires_at" defaultValue={editingItem?.expires_at ? new Date(editingItem.expires_at).toISOString().slice(0, 16) : ""} className={inputCls} /></div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2">
              <Send size={14} />{editingItem ? "Update" : "Publish"} Announcement</button>
            <button type="button" onClick={closeModal} className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">Cancel</button>
          </div>
        </form>
      );
      default: return null;
    }
  };

  // ── Table renderers ────────────────────────────────────────────────────────────
  const TH = ({ cols }) => (
    <thead><tr className="bg-gray-700/40 border-b border-gray-700">
      {cols.map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
    </tr></thead>
  );

  // ── Audit Filter Bar ───────────────────────────────────────────────────────────
  const AuditFilters = () => {
    const actionTypes = [
      { value: '', label: 'All Actions' },
      { value: 'CREATE', label: 'Created' },
      { value: 'UPDATE', label: 'Updated' },
      { value: 'DELETE', label: 'Deleted' },
      { value: 'ASSIGN', label: 'Assigned' },
      { value: 'LOGIN', label: 'Login' },
    ];

    const entityTypes = [
      { value: '', label: 'All Entities' },
      { value: 'TICKET', label: 'Tickets' },
      { value: 'USER', label: 'Users' },
      { value: 'SYSTEM', label: 'Systems' },
      { value: 'DEPARTMENT', label: 'Departments' },
      { value: 'BRANCH', label: 'Branches' },
      { value: 'TEMPLATE', label: 'Templates' },
      { value: 'ANNOUNCEMENT', label: 'Announcements' },
    ];

    const selCls = "px-3 py-2 border border-gray-600 bg-gray-700/60 text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
      <div className="flex flex-wrap gap-3 items-center">
        <select value={auditFilters.action_type}
          onChange={(e) => setAuditFilters(prev => ({ ...prev, action_type: e.target.value }))}
          className={selCls}>
          {actionTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select value={auditFilters.entity_type}
          onChange={(e) => setAuditFilters(prev => ({ ...prev, entity_type: e.target.value }))}
          className={selCls}>
          {entityTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input type="date" value={auditFilters.start_date}
          onChange={(e) => setAuditFilters(prev => ({ ...prev, start_date: e.target.value }))}
          className={selCls} placeholder="Start Date" />

        <input type="date" value={auditFilters.end_date}
          onChange={(e) => setAuditFilters(prev => ({ ...prev, end_date: e.target.value }))}
          className={selCls} placeholder="End Date" />

        <button onClick={() => setAuditFilters({ action_type: '', entity_type: '', start_date: '', end_date: '' })}
          className="px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition text-sm">
          Clear Filters
        </button>
      </div>
    );
  };

  const renderTable = () => {
    switch (activeTab) {
      case "tickets": return (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TH cols={["#", "Date", "Reported By", "Assigned To", "System", "Problem", "Down Time", "Up Time", "Risk", "Status", "Actions"]} />
              <tbody className="divide-y divide-gray-700/70">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <EmptyState label="tickets" />
                    </td>
                  </tr>
                ) : (
                  tickets.map(t => {
                    const risk = RISK_CFG[t.risk_label] || RISK_CFG.LOW;
                    const status = STATUS_CFG[t.status] || STATUS_CFG.open;
                    const dt = t.down_time ? relTime(t.down_time) : null;
                    const editable = canEditTicket(t);
                    return (
                      <tr key={t.id} className="hover:bg-gray-700/30 transition-colors group">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{t.ticket_sl}</td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                              <User size={12} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-200 whitespace-nowrap text-xs">{t.reportedByName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {users.find(u => u.email === t.assigned_to_email)?.name || t.assigned_to_name || <span className="text-gray-600 italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Server size={11} className="text-gray-500 flex-shrink-0" />
                            <span className="text-gray-300 font-medium whitespace-nowrap text-xs">{t.system_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate text-xs" title={t.problem_details}>{t.problem_details}</td>
                        <td className="px-4 py-3">
                          {dt ? (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${dt.bg} ${dt.tc} w-fit text-xs font-semibold`}>
                              <Clock size={10} />
                              {dt.text}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {t.up_time ? new Date(t.up_time).toLocaleString() : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${risk.color}`}>{risk.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                            <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal("viewTicket", t)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition">
                              <Eye size={14} />
                            </button>
                            {editable && (
                              <button onClick={() => openModal("editTicket", t)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition">
                                <Edit size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <PaginationBar
            current={currentPage}
            total={totalPages}
            count={totalCount}
            pageSize={PAGE_SIZE}
            onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          />
        </>
      );
      case "users": return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TH cols={["Name", "Email", "Employee ID", "PABX", "Mobile", "Role", "Department", "Branch", "Actions"]} />
            <tbody className="divide-y divide-gray-700/70">
              {filtered.users.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState label="users" />
                  </td>
                </tr>
              ) : (
                filtered.users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-200 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono">{u.employee_id || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.pabx_extension || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.mobile_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === "admin" ? "bg-violet-500/20 text-violet-300" : "bg-indigo-500/20 text-indigo-300"}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.department || <span className="text-gray-600">—</span>}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.branch || <span className="text-gray-600">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                        <button onClick={() => openModal("user", u)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition">
                          <Edit size={14} />
                        </button>
                        {/* DELETE BUTTON REMOVED - Users cannot delete */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );

      case "systems":
      case "departments":
      case "branches": {
        const map = { systems: ["system", "System Name"], departments: ["department", "Department Name"], branches: ["branch", "Branch Name"] };
        const [type, colName] = map[activeTab];
        const items = filtered[activeTab];
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TH cols={["ID", colName, "Actions"]} />
              <tbody className="divide-y divide-gray-700/70">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState label={activeTab} />
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-200">{item.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(type, item)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition">
                            <Edit size={14} />
                          </button>
                          {/* DELETE BUTTON REMOVED */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      }

      case "templates": return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TH cols={["ID", "Name", "Category", "System", "Risk", "Actions"]} />
            <tbody className="divide-y divide-gray-700/70">
              {filtered.templates.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState label="templates" />
                  </td>
                </tr>
              ) : (
                filtered.templates.map(t => (
                  <tr key={t.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-200">{t.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.category}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.system_name}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${RISK_CFG[t.risk_label]?.color || "bg-gray-700 text-gray-400"}`}>{t.risk_label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal("template", t)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition">
                          <Edit size={14} />
                        </button>
                        {/* DELETE BUTTON REMOVED */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );

      case "announcements": return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TH cols={["Title", "Message", "Priority", "Status", "Created", "Expires", "Actions"]} />
            <tbody className="divide-y divide-gray-700/70">
              {filtered.announcements.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState label="announcements" />
                  </td>
                </tr>
              ) : (
                filtered.announcements.map(a => {
                  const isExpired = a.expires_at && new Date(a.expires_at) < new Date();
                  const pc = PRIORITY_CFG[a.priority] || PRIORITY_CFG.normal;
                  return (
                    <tr key={a.id} className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-4 py-3 font-semibold text-gray-200 max-w-[180px] truncate text-sm" title={a.title}>{a.title}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[250px] truncate text-xs" title={a.content}>{a.content}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pc.color}`}>{pc.label}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleAnnouncementActive(a.id, a.is_active)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${a.is_active && !isExpired ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
                          {a.is_active && !isExpired ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          {a.is_active && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : "Never"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal("announcement", a)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition">
                            <Edit size={14} />
                          </button>
                          {/* DELETE BUTTON REMOVED */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      );

      case "audit": return (
        <div className="space-y-4 p-4">
          {/* Summary Cards */}
          {auditSummary && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-gradient-to-br from-blue-500/10 to-gray-800 rounded-xl p-3 border border-blue-500/30">
                <p className="text-xs text-gray-400">Total Actions</p>
                <p className="text-xl font-bold text-gray-100">{auditSummary.total_actions || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-gray-800 rounded-xl p-3 border border-green-500/30">
                <p className="text-xs text-gray-400">Creates</p>
                <p className="text-xl font-bold text-green-400">{auditSummary.total_creates || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-gray-800 rounded-xl p-3 border border-blue-500/30">
                <p className="text-xs text-gray-400">Updates</p>
                <p className="text-xl font-bold text-blue-400">{auditSummary.total_updates || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-gray-800 rounded-xl p-3 border border-red-500/30">
                <p className="text-xs text-gray-400">Deletes</p>
                <p className="text-xl font-bold text-red-400">{auditSummary.total_deletes || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-gray-800 rounded-xl p-3 border border-purple-500/30">
                <p className="text-xs text-gray-400">Assigns</p>
                <p className="text-xl font-bold text-purple-400">{auditSummary.total_assigns || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-gray-800 rounded-xl p-3 border border-orange-500/30">
                <p className="text-xs text-gray-400">Active Users</p>
                <p className="text-xl font-bold text-orange-400">{auditSummary.active_users || 0}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <AuditFilters />

          {/* Audit Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <TH cols={["Timestamp", "User", "Action", "Entity", "Description", "IP Address"]} />
              <tbody className="divide-y divide-gray-700/70">
                {loadingAudit ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center"><Spinner color="indigo" /></td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">No audit logs found</td>
                  </tr>
                ) : (
                  auditLogs.map(log => {
                    const actionColors = {
                      CREATE: 'bg-green-500/20 text-green-300',
                      UPDATE: 'bg-blue-500/20 text-blue-300',
                      DELETE: 'bg-red-500/20 text-red-300',
                      ASSIGN: 'bg-purple-500/20 text-purple-300',
                      LOGIN: 'bg-amber-500/20 text-amber-300',
                      LOGOUT: 'bg-gray-600/40 text-gray-300',
                    };

                    // Parse the changes to get human-readable description
                    let description = '';
                    let fullDescription = '';
                    let changesData = null;
                    let hasDetails = false;

                    try {
                      if (log.changes) {
                        changesData = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
                        fullDescription = changesData.full_description || changesData.details || '';
                        description = changesData.summary || changesData.full_description || changesData.details || '';

                        // Check for details in different structures
                        if (log.entity_type === 'TICKET' && changesData.details) {
                          hasDetails = Object.keys(changesData.details).length > 0;
                        } else if (changesData.changes && typeof changesData.changes === 'object') {
                          hasDetails = Object.keys(changesData.changes).length > 0;
                        } else if (changesData.details && typeof changesData.details === 'object') {
                          hasDetails = Object.keys(changesData.details).length > 0;
                        }
                      }
                    } catch (e) {
                      description = log.changes || '';
                    }

                    // Also allow View Details when old/new values exist (CREATE/DELETE)
                    if (!hasDetails && (log.old_value || log.new_value)) {
                      hasDetails = true;
                    }

                    // If no structured data, use the old format
                    if (!description && log.action_type) {
                      if (log.action_type === 'CREATE') {
                        description = `Created ${log.entity_type?.toLowerCase()} ${log.entity_id}`;
                      } else if (log.action_type === 'DELETE') {
                        description = `Deleted ${log.entity_type?.toLowerCase()} ${log.entity_id}`;
                      } else if (log.action_type === 'UPDATE') {
                        description = `Updated ${log.entity_type?.toLowerCase()} ${log.entity_id}`;
                      } else {
                        description = `${log.action_type} ${log.entity_type?.toLowerCase()}`;
                      }
                    }

                    return (
                      <tr key={log.id} className="hover:bg-gray-700/30 transition-colors group">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-200 text-sm">{log.user_name}</span>
                            <span className="text-xs text-gray-500">{log.user_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${actionColors[log.action_type] || 'bg-gray-700 text-gray-400'}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-300">{log.entity_type}</span>
                        </td>
                        <td className="px-4 py-3 max-w-md">
                          <div className="text-xs text-gray-300">
                            {fullDescription && (
                              <span className="font-medium text-gray-200">{fullDescription}</span>
                            )}
                            {!fullDescription && description && (
                              <span>{description}</span>
                            )}
                            {!fullDescription && !description && (
                              <span className="text-gray-500">No details</span>
                            )}
                          </div>
                          {/* ✅ RESTORED: View Details button */}
                          {hasDetails && (
                            <button
                              onClick={() => openAuditDetails(log)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.ip_address || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination hint */}
          {auditLogs.length > 0 && (
            <div className="text-center text-xs text-gray-500 py-2">
              Showing {auditLogs.length} records
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  const ADD_MAP = { tickets: null, users: "user", systems: "system", departments: "department", branches: "branch", templates: "template", announcements: "announcement", audit: null };
  const isDataTab = Object.keys(ADD_MAP).includes(activeTab) && activeTab !== "overview";

  // Toast notifications state for audit
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [auditFilters, setAuditFilters] = useState({ action_type: '', entity_type: '', start_date: '', end_date: '' });

  // Fetch audit data
  const fetchAuditLogs = useCallback(async () => {
    if (!token) return;
    setLoadingAudit(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        getAuditLogs(token, auditFilters),
        getAuditSummary(token, auditFilters)
      ]);
      setAuditLogs(logsRes?.data || logsRes || []);
      setAuditSummary(summaryRes?.data || summaryRes || null);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      notify("Failed to load audit trail", "error");
    } finally {
      setLoadingAudit(false);
    }
  }, [token, auditFilters, notify]);

  // Fetch audit data when audit tab is active or filters change
  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, auditFilters, fetchAuditLogs]);

  const toggleAnnouncementActive = async (id, cur) => {
    try {
      await updateAnnouncement(id, { is_active: !cur }, token);
      notify(`Announcement ${!cur ? "activated" : "deactivated"}`);
      fetchEntities();
    } catch (err) { notify(err.message, "error"); }
  };

  // ── Audit "View Details" parser (from your original code) ─────────
  const openAuditDetails = (log) => {
    let oldValueObj = {};
    let newValueObj = {};
    let detailsObject = {};
    let summaryText = '';
    let fullDescription = '';

    try {
      if (log.changes) {
        const changesData = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;

        // Extract summary and description
        summaryText = changesData.summary || changesData.details || '';
        fullDescription = changesData.full_description || changesData.details || '';

        // CASE 1: TICKET updates - has changes.details structure
        if (log.entity_type === 'TICKET' && changesData.details) {
          detailsObject = changesData.details;
          Object.entries(detailsObject).forEach(([key, val]) => {
            oldValueObj[key] = val.old;
            newValueObj[key] = val.new;
          });
        }
        // CASE 2: Entity updates with changes.changes structure (USER, SYSTEM, etc.)
        else if (changesData.changes && typeof changesData.changes === 'object') {
          detailsObject = changesData.changes;
          Object.entries(detailsObject).forEach(([key, val]) => {
            oldValueObj[key] = val.old;
            newValueObj[key] = val.new;
          });
        }
        // CASE 3: Direct flat changes object
        else if (changesData.details && typeof changesData.details === 'object') {
          detailsObject = changesData.details;
          Object.entries(detailsObject).forEach(([key, val]) => {
            oldValueObj[key] = val.old;
            newValueObj[key] = val.new;
          });
        }
      }

      // Parse old_value and new_value columns for additional context
      if (log.old_value && Object.keys(oldValueObj).length === 0) {
        try {
          const parsed = typeof log.old_value === 'string' ? JSON.parse(log.old_value) : log.old_value;
          Object.keys(parsed).forEach(key => {
            if (key !== 'created_at' && key !== 'updated_at') {
              oldValueObj[key] = parsed[key];
            }
          });
        } catch (e) { console.error('Error parsing old_value:', e); }
      }

      if (log.new_value && Object.keys(newValueObj).length === 0) {
        try {
          const parsed = typeof log.new_value === 'string' ? JSON.parse(log.new_value) : log.new_value;
          Object.keys(parsed).forEach(key => {
            if (key !== 'created_at' && key !== 'updated_at') {
              newValueObj[key] = parsed[key];
            }
          });
        } catch (e) { console.error('Error parsing new_value:', e); }
      }

      // For DELETE actions without details, build from old_value
      if (log.action_type === 'DELETE' && Object.keys(detailsObject).length === 0 && Object.keys(oldValueObj).length > 0) {
        Object.entries(oldValueObj).forEach(([key, val]) => {
          if (key !== 'created_at' && key !== 'updated_at') {
            detailsObject[key] = {
              old: val === null || val === undefined ? 'Not set' : String(val),
              new: 'Deleted'
            };
          }
        });
      }

      // For CREATE actions without details, build from new_value
      if (log.action_type === 'CREATE' && Object.keys(detailsObject).length === 0 && Object.keys(newValueObj).length > 0) {
        Object.entries(newValueObj).forEach(([key, val]) => {
          if (key !== 'created_at' && key !== 'updated_at') {
            detailsObject[key] = {
              old: 'Not set',
              new: val === null || val === undefined ? 'Not set' : String(val)
            };
          }
        });
      }

      // For LOGIN/LOGOUT actions - don't show change details
      if (log.action_type === 'LOGIN' || log.action_type === 'LOGOUT' || log.action_type === 'LOGIN_FAILED') {
        detailsObject = {};
        summaryText = summaryText || `${log.action_type} by ${log.user_name || log.user_email}`;
      }

    } catch (e) {
      console.error('Error parsing audit data:', e);
    }

    setSelectedAuditDetails({
      entity_id: log.entity_id,
      entity_type: log.entity_type,
      summary: summaryText || (log.action_type === 'CREATE' ? `Created new ${log.entity_type?.toLowerCase()}` :
        log.action_type === 'DELETE' ? `Deleted ${log.entity_type?.toLowerCase()}` :
          log.action_type === 'UPDATE' ? `Updated ${log.entity_type?.toLowerCase()}` :
            `${log.action_type} event`),
      full_description: fullDescription || '',
      details: detailsObject,
      oldValue: oldValueObj,
      newValue: newValueObj,
      user_name: log.user_name,
      user_email: log.user_email,
      timestamp: log.created_at,
      action: log.action_type
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center space-y-4">
        <div className="h-14 w-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 font-medium">Loading dashboard…</p>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-900 font-sans text-gray-100">

      {/* Toast */}
      <div className="fixed top-4 right-4 space-y-2 z-[70] pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${n.type === "success" ? "bg-gradient-to-r from-emerald-600 to-green-700" : "bg-gradient-to-r from-red-600 to-rose-700"}`}>
            {n.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{n.msg}
          </div>
        ))}
      </div>

      {/* ════════════════════════ SIDEBAR ════════════════════════ */}
      <aside className={`${collapsed ? "w-16" : "w-56"} flex-shrink-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col transition-all duration-300 ease-in-out relative z-20 shadow-2xl border-r border-slate-800`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Shield size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight">Admin Portal</p>
              <p className="text-slate-400 text-xs">CBC PMS System</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const badge = id === "tickets" ? (dashStats.open || 0) : id === "announcements" ? announcements.filter(a => a.is_active).length : 0;
            return (
              <button key={id} onClick={() => setActiveTab(id)} title={collapsed ? label : ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/60" : "text-slate-400 hover:bg-slate-800/70 hover:text-white"}`}>
                <Icon size={17} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-300"}`} />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {!collapsed && badge > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${id === "tickets" ? "bg-red-500 text-white" : "bg-amber-400 text-gray-900"}`}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-indigo-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name || "Admin"}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[88px] bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full p-1 shadow-lg transition-all hover:bg-indigo-600 hover:border-indigo-500 z-30">
          <ChevronLeft size={13} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* ════════════════════════ MAIN ════════════════════════ */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-2.5 flex items-center justify-between shadow-md shadow-black/20 flex-shrink-0 z-10">

          {/* LEFT TITLE */}
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white truncate">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
              {activeTab === "overview"
                ? `Welcome back, ${user?.name || "Admin"}`
                : `Manage your ${activeTab}`}
            </p>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">

            {/* DATE FILTER (FIXED ALIGNMENT) */}
            {(activeTab === "overview" || activeTab === "tickets") && (
              <div className="hidden sm:flex items-center bg-gray-700/60 border border-gray-600 rounded-lg p-1">
                {[
                  { l: "All", v: "all" },
                  { l: "Today", v: "today" },
                  { l: "Week", v: "week" },
                  { l: "Month", v: "month" },
                  { l: "Year", v: "year" }
                ].map(b => (
                  <button
                    key={b.v}
                    onClick={() => setDateFilter(b.v)}
                    className={`h-8 px-3 flex items-center justify-center rounded-md text-xs font-medium transition-colors duration-150
              ${dateFilter === b.v
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-600/40"
                      }
            `}
                  >
                    {b.l}
                  </button>
                ))}
              </div>
            )}

            {/* REFRESH BUTTON */}
            <button
              onClick={() => { reload(); fetchTopSystems(); fetchDownAtms(); }}
              title="Refresh"
              className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors duration-150"
            >
              <RefreshCw size={15} />
            </button>

            {/* NOTIFICATION */}
            <div className="relative">
              {dashStats.open > 0 && (
                <div className="h-1.5 w-1.5 bg-red-500 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
              )}
              <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-150">
                <Bell size={15} />
              </button>
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-2 md:px-6 py-2 custom-scrollbar">

          {/* ══════════════ OVERVIEW ══════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-2">

              <div className="flex flex-col xl:flex-row gap-3 items-stretch">

                {/* ================= HERO BANNER (SMALLER 40%) ================= */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md px-4 py-3 
    flex flex-col md:flex-row md:items-center justify-between gap-2 
    xl:w-[40%]">

                  {/* LEFT TEXT */}
                  <div className="min-w-0 leading-tight">

                    <p className="text-sm text-gray-400 leading-tight">
                      Good{" "}
                      {new Date().getHours() >= 6 && new Date().getHours() < 12
                        ? "Morning"
                        : new Date().getHours() >= 12 && new Date().getHours() < 17
                          ? "Afternoon"
                          : new Date().getHours() >= 17 && new Date().getHours() < 21
                            ? "Evening"
                            : "Night"}
                      ,{" "}
                      <span className="text-gray-200 font-semibold">
                        {user?.name?.split(" ")[0] || "Admin"}
                      </span>{" "}
                      👋
                    </p>

                    <h2 className="text-lg font-semibold text-white leading-tight">
                      IT Operations Overview
                    </h2>

                    <p className="text-xs text-gray-500 leading-tight">
                      Real-time CBC IT operations insights
                    </p>

                  </div>

                  {/* RIGHT SLA */}
                  <div className="flex-shrink-0 scale-90 origin-right">
                    <SLACircle sla={slaAchievement} />
                  </div>

                </div>

                {/* ================= QUICK COUNTS (BIGGER 60%) ================= */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 xl:w-[60%]">

                  {[
                    {
                      label: "Total Users",
                      value: users.length,
                      icon: Users,
                      accent: "text-violet-400",
                      bg: "bg-violet-500/20",
                      tab: "users",
                    },
                    {
                      label: "Systems",
                      value: systems.length,
                      icon: Database,
                      accent: "text-cyan-400",
                      bg: "bg-cyan-500/20",
                      tab: "systems",
                    },
                    {
                      label: "Departments",
                      value: departments.length,
                      icon: Layout,
                      accent: "text-sky-400",
                      bg: "bg-sky-500/20",
                      tab: "departments",
                    },
                    {
                      label: "Branches",
                      value: branches.length,
                      icon: MapPin,
                      accent: "text-teal-400",
                      bg: "bg-teal-500/20",
                      tab: "branches",
                    },
                    {
                      label: "Announcements",
                      value: announcements.filter(a => a.is_active).length,
                      icon: Megaphone,
                      accent: "text-amber-400",
                      bg: "bg-amber-500/20",
                      tab: "announcements",
                    },
                  ].map(({ label, value, icon: Icon, accent, bg, tab }) => (
                    <div
                      key={label}
                      onClick={() => setActiveTab(tab)}
                      className="
        bg-gray-800 rounded-xl border border-gray-700
        p-2.5 shadow-md flex items-center gap-2.5
        hover:border-indigo-500 hover:bg-gray-750
        cursor-pointer transition-all duration-200
        hover:-translate-y-0.5
      "
                    >
                      <div
                        className={`h-8 w-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={15} className={accent} />
                      </div>

                      <div className="leading-tight">
                        <p className="text-2xl font-bold text-white">
                          {value}
                        </p>
                        <p className="text-xs text-gray-500">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>

              </div>

              {/* ✅ Stat cards with comparisons (↑ 12% from last month etc.) */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
                <StatCard
                  label="Total Tickets"
                  value={dashStats.total || 0}
                  color="indigo"
                  Icon={FileText}
                  active={selectedCard === "all"}
                  onClick={() => handleCardClick("all")}
                  comparison={comparisons?.total}
                />

                <StatCard
                  label="Open Tickets"
                  value={dashStats.open || 0}
                  color="red"
                  Icon={AlertCircle}
                  active={selectedCard === "open"}
                  onClick={() => handleCardClick("open")}
                  comparison={comparisons?.open}
                  goodWhenDown
                />

                <StatCard
                  label="In Progress"
                  value={dashStats.progress || 0}
                  color="amber"
                  Icon={Activity}
                  active={selectedCard === "in-progress"}
                  onClick={() => handleCardClick("in-progress")}
                  comparison={comparisons?.progress}
                  goodWhenDown
                />

                <StatCard
                  label="Resolved"
                  value={dashStats.resolved || 0}
                  color="emerald"
                  Icon={CheckCircle}
                  active={selectedCard === "resolved"}
                  onClick={() => handleCardClick("resolved")}
                  comparison={comparisons?.resolved}
                />
              </div>


              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <DonutChart
                  data={statusChart}
                  title="Status Overview"
                  subtitle={`${dashStats.total || 0} tickets`}
                  iconBg="bg-indigo-500/20"
                  IconEl={<TrendingUp size={13} className="text-indigo-400" />}
                />

                <DonutChart
                  data={riskChart}
                  title="Risk Overview"
                  subtitle="Active only"
                  iconBg="bg-orange-500/20"
                  IconEl={<AlertCircle size={13} className="text-orange-400" />}
                />

                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-3 flex flex-col h-[260px]">

                  {/* HEADER */}
                  <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <div className="h-6 w-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={14} className="text-red-400" />
                    </div>

                    <h2 className="font-bold text-gray-100 text-base">
                      Critical Operations Monitor
                    </h2>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col gap-1 flex-1 overflow-hidden">

                    <div className="flex items-center justify-between p-1 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-100">ATM Offline</p>
                        <p className="text-xs text-gray-500">Requires immediate attention</p>
                      </div>
                      <p className="text-2xl font-bold text-red-400">{criticalOps.atmOffline}</p>
                    </div>

                    <div className="flex items-center justify-between p-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div>
                        <p className="text-sm font-semibold text-gray-100">High Risk Tickets</p>
                        <p className="text-xs text-gray-500">Unresolved high priority</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{criticalOps.highRisk}</p>
                    </div>

                    <div className="flex items-center justify-between p-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div>
                        <p className="text-sm font-semibold text-gray-100">SLA Breaches</p>
                        <p className="text-xs text-gray-500">SLA breached tickets</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-400">{criticalOps.slaBreaches}</p>
                    </div>

                    <div className="flex items-center justify-between p-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div>
                        <p className="text-sm font-semibold text-gray-100">Healthy Systems</p>
                        <p className="text-xs text-gray-500">All systems operational</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">{criticalOps.healthySystems}</p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Top Systems / Down ATMs row */}
              {/* Top Systems / Down ATMs row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ================= TOP SYSTEMS ================= */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-3 flex flex-col h-[260px]">

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-purple-500/20 rounded-md flex items-center justify-center">
                        <Server size={12} className="text-purple-400" />
                      </div>

                      <h2 className="font-bold text-gray-100 text-sm">
                        Top Affected Systems
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {topStats.totalTickets > 0 && (
                        <span className="text-xs text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded-md">
                          {topStats.totalTickets} tickets
                        </span>
                      )}
                      <button
                        onClick={fetchTopSystems}
                        className="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-md"
                      >
                        <RefreshCw size={11} />
                      </button>
                    </div>

                  </div>

                  {/* SCROLL AREA */}
                  <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">

                    {topSystems.map((s, i) => (
                      <div key={s.system_name || i}>

                        <div className="flex items-center justify-between mb-0.5">

                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs font-bold px-1 py-0.5 rounded flex-shrink-0`}>
                              #{i + 1}
                            </span>

                            <span className="font-semibold text-gray-200 text-xs truncate">
                              {s.system_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-bold text-gray-100">
                              {s.ticket_count}
                            </span>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {s.percentage}%
                            </span>
                          </div>

                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-purple-400 h-1"
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>

                      </div>
                    ))}

                  </div>

                  {/* FOOTER */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-700 grid grid-cols-3 gap-2">
                    {[
                      ["Total", topStats.totalTickets],
                      ["Unique", topStats.uniqueSystems],
                      ["Top %", `${topStats.topSystemPercentage || 0}%`]
                    ].map(([l, v]) => (
                      <div key={l} className="text-center">
                        <p className="text-xs text-gray-500">{l}</p>
                        <p className="font-bold text-gray-200 text-sm">{v}</p>
                      </div>
                    ))}
                  </div>

                </div>

                {/* ================= ATM MONITOR ================= */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-3 flex flex-col h-[260px]">

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-red-500/20 rounded-md flex items-center justify-center">
                        <AlertTriangle size={14} className="text-red-400" />
                      </div>

                      <h2 className="font-bold text-gray-100 text-base">
                        ATM Monitoring
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">

                      {downAtms.length > 0 && (
                        <span className="bg-red-600 text-white text-sm font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {downAtms.length} Down
                        </span>
                      )}

                      <button
                        onClick={fetchDownAtms}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                      >
                        <RefreshCw size={12} />
                      </button>

                    </div>

                  </div>

                  {/* LIST */}
                  <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">

                    {downAtms.map((atm, i) => (
                      <div
                        key={atm.id || i}
                        className="flex items-start justify-between p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition cursor-pointer"
                      >

                        <div className="min-w-0">

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-100 text-base">
                              {atm.system_name || `ATM ${i + 1}`}
                            </span>

                            <span className="text-sm px-1.5 py-0.5 rounded font-bold bg-red-500/30 text-red-300">
                              {atm.risk_label || "—"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-400 truncate">
                            {atm.branch || "Location N/A"}
                          </p>

                        </div>

                        <div className="text-right flex-shrink-0">

                          <p className="text-base font-bold text-red-400">
                            {atm._duration}
                          </p>

                          <p className="text-sm text-gray-400">
                            {atm.status === "open" ? "Critical" : "Progress"}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>

                </div>

              </div>




            </div>
          )}

          {/* ══════════════ DATA TABS ══════════════ */}
          {isDataTab && activeTab !== "overview" && (
            <div className="space-y-4">

              {/* Stat mini-cards only for tickets (with comparisons) */}
              {activeTab === "tickets" && (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <StatCard label="Total" value={dashStats.total || 0} color="indigo" Icon={FileText} active={selectedCard === "all"} onClick={() => handleCardClick("all")} comparison={comparisons?.total} />
                  <StatCard label="Open" value={dashStats.open || 0} color="red" Icon={AlertCircle} active={selectedCard === "open"} onClick={() => handleCardClick("open")} comparison={comparisons?.open} goodWhenDown />
                  <StatCard label="In Progress" value={dashStats.progress || 0} color="amber" Icon={Activity} active={selectedCard === "in-progress"} onClick={() => handleCardClick("in-progress")} comparison={comparisons?.progress} goodWhenDown />
                  <StatCard label="Resolved" value={dashStats.resolved || 0} color="emerald" Icon={CheckCircle} active={selectedCard === "resolved"} onClick={() => handleCardClick("resolved")} comparison={comparisons?.resolved} />
                </div>
              )}

              {/* Toolbar */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-4 space-y-3">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    <div className="relative min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input type="text" placeholder={`Search ${activeTab}…`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-600 bg-gray-700/60 text-gray-100 placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    {activeTab === "tickets" && (
                      <>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                          className="px-3 py-2.5 border border-gray-600 bg-gray-700/60 text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                          <option value="all">All Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option>
                        </select>
                        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
                          className="px-3 py-2.5 border border-gray-600 bg-gray-700/60 text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                          <option value="all">All Risk</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                        </select>
                      </>
                    )}
                    {searchTerm && <button onClick={() => setSearchTerm("")} className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition"><X size={14} /></button>}
                  </div>
                  {ADD_MAP[activeTab] && (
                    <button onClick={() => openModal(ADD_MAP[activeTab])}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-950/40 transition text-sm flex-shrink-0">
                      <Plus size={15} />Add {ADD_MAP[activeTab].charAt(0).toUpperCase() + ADD_MAP[activeTab].slice(1)}
                    </button>
                  )}
                </div>

                {activeTab === "tickets" && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-700">
                    {DATE_FILTERS.map(b => (
                      <button key={b.v} onClick={() => setDateFilter(b.v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateFilter === b.v ? "bg-indigo-600 text-white shadow" : "bg-gray-700/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200"}`}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">{renderTable()}</div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════ MODALS ══════════ */}

      {/* Generic create/edit */}
      {showModal && !["viewTicket", "editTicket"].includes(modalType) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-white">{editingItem ? "Edit" : "New"} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{editingItem ? "Update the details below" : "Fill in the details to create"}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-xl transition"><X size={17} /></button>
            </div>
            <div className="p-6">{renderModalContent()}</div>
          </div>
        </div>
      )}

      {/* View ticket */}
      {modalType === "viewTicket" && editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md"><FileText size={17} className="text-white" /></div>
                <div><h2 className="font-bold text-white">Ticket Details</h2><p className="text-gray-400 text-xs font-mono">#{editingItem.ticket_sl}</p></div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-xl transition"><X size={17} className="text-gray-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[["Ticket SL", editingItem.ticket_sl], ["Month", editingItem.month], ["System", editingItem.system_name],
                ["Department", editingItem.department], ["Branch", editingItem.branch], ["Affected User", editingItem.affected_user || editingItem.affectedUser],
                ["PC Name", editingItem.pc_name || editingItem.pcName], ["Reported By", editingItem.reportedByName],
                ["Assigned To", users.find(u => u.email === editingItem.assigned_to_email)?.name || editingItem.assigned_to_name || "Unassigned"],
                ["Report Date", editingItem.date ? new Date(editingItem.date).toLocaleDateString() : "—"],
                ["Down Time", editingItem.down_time ? new Date(editingItem.down_time).toLocaleString() : "—"],
                ["Up Time", editingItem.up_time ? new Date(editingItem.up_time).toLocaleString() : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-700/40 rounded-xl p-3 border border-gray-600/60">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{l}</p>
                    <p className="font-semibold text-gray-200 mt-1 text-sm">{v || "—"}</p>
                  </div>
                ))}
                <div className="bg-gray-700/40 rounded-xl p-3 border border-gray-600/60">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Risk</p>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-bold ${RISK_CFG[editingItem.risk_label]?.color || "bg-gray-700 text-gray-400"}`}>{editingItem.risk_label || "—"}</span>
                </div>
                <div className="bg-gray-700/40 rounded-xl p-3 border border-gray-600/60">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_CFG[editingItem.status]?.color || "bg-gray-700 text-gray-400"}`}>{STATUS_CFG[editingItem.status]?.label || editingItem.status || "—"}</span>
                </div>
              </div>
              {[["Problem Details", editingItem.problem_details || editingItem.problemDetails], ["Root Cause", editingItem.root_cause || editingItem.rootCause], ["Resolution", editingItem.resolution], ["Admin Remarks", editingItem.remarks_by_admin]].map(([l, v]) =>
                v ? <div key={l} className="bg-gray-700/40 rounded-xl p-4 mb-3 border border-gray-600/60"><p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">{l}</p><p className="text-gray-300 text-sm whitespace-pre-wrap">{v}</p></div> : null
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-700 bg-gray-800/80 rounded-b-2xl">
              <button onClick={closeModal} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition font-semibold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit ticket - with permission check */}
      {modalType === "editTicket" && editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md"><Edit size={17} className="text-white" /></div>
                <div><h2 className="font-bold text-white">Edit Ticket</h2><p className="text-gray-400 text-xs">#{editingItem.ticket_sl}</p></div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-xl transition"><X size={17} className="text-gray-400" /></button>
            </div>
            {!canEditTicket(editingItem) ? (
              <div className="p-6 text-center">
                <div className="h-14 w-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={22} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Permission Denied</h3>
                <p className="text-gray-400 text-sm">You can only edit tickets that you created or are assigned to.</p>
                <button onClick={closeModal} className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition font-semibold text-sm">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateTicket} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[["System Name", "system_name", editingItem.system_name], ["Department", "department", editingItem.department], ["Branch", "branch", editingItem.branch], ["Affected User", "affected_user", editingItem.affected_user]].map(([l, n, v]) => (
                    <div key={n}><label className={labelCls}>{l}</label><input type="text" name={n} defaultValue={v} className={inputCls + " focus:ring-emerald-500"} /></div>
                  ))}
                  <div><label className={labelCls}>Risk Level</label>
                    <select name="risk_label" defaultValue={editingItem.risk_label} className={inputCls + " focus:ring-emerald-500"}>
                      <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
                  <div><label className={labelCls}>Status</label>
                    <select name="status" defaultValue={editingItem.status} className={inputCls + " focus:ring-emerald-500"}>
                      <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option></select></div>
                  <div><label className={labelCls}>Assign To (Email)</label>
                    <input type="email" name="assigned_to_email" defaultValue={editingItem.assigned_to_email || ""} placeholder="Leave empty to unassign" className={inputCls + " focus:ring-emerald-500"} /></div>
                  <div>{/* spacer */}</div>
                  <div><label className={labelCls}>Down Time</label>
                    <input type="datetime-local" name="down_time" defaultValue={editingItem.down_time ? new Date(editingItem.down_time).toISOString().slice(0, 16) : ""} className={inputCls + " focus:ring-emerald-500"} /></div>
                  <div><label className={labelCls}>Up Time</label>
                    <input type="datetime-local" name="up_time" defaultValue={editingItem.up_time ? new Date(editingItem.up_time).toISOString().slice(0, 16) : ""} className={inputCls + " focus:ring-emerald-500"} /></div>
                </div>
                {[["Problem Details", "problem_details", editingItem.problem_details, 3], ["Root Cause", "root_cause", editingItem.root_cause, 2], ["Resolution", "resolution", editingItem.resolution, 2], ["Admin Remarks", "remarks_by_admin", editingItem.remarks_by_admin, 2]].map(([l, n, v, r]) => (
                  <div key={n}><label className={labelCls}>{l}</label><textarea name={n} rows={r} defaultValue={v || ""} className={inputCls + " focus:ring-emerald-500 resize-none"} /></div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-500 transition font-semibold text-sm">Update Ticket</button>
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm - DISABLED */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-scale-up text-center">
            <div className="h-14 w-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
            <h3 className="text-lg font-bold text-white mb-1">Delete {deleteType}?</h3>
            <p className="text-gray-400 text-sm mb-6">Delete operations are disabled for your role.</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteConfirm(null); setDeleteType(null); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition font-semibold text-sm">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESTORED: Audit Details Modal (dark theme, full original functionality) */}
      {selectedAuditDetails && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up flex flex-col">
            {/* Header with Gradient - Dynamic based on entity type */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {selectedAuditDetails.entity_type === 'TICKET' && <Ticket size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'USER' && <Users size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'SYSTEM' && <Database size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'DEPARTMENT' && <Layout size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'BRANCH' && <MapPin size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'TEMPLATE' && <FileText size={18} className="text-white" />}
                  {selectedAuditDetails.entity_type === 'ANNOUNCEMENT' && <Megaphone size={18} className="text-white" />}
                  {!selectedAuditDetails.entity_type && <Activity size={18} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedAuditDetails.entity_type} Changes Details
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {selectedAuditDetails.entity_type} ID: {selectedAuditDetails.entity_id}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAuditDetails(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-110">
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {/* Highlighted Changes Section - At the Top */}
              <div className="px-6 pt-5 pb-4 bg-amber-500/5 border-b border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <AlertCircle size={16} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-amber-400 uppercase tracking-wide">What Changed?</p>
                </div>

                {Object.keys(selectedAuditDetails.details).length === 0 ? (
                  <div className="text-center py-6">
                    <Info size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      {selectedAuditDetails.action === 'LOGIN' ? 'User login event - no data changes' :
                        selectedAuditDetails.action === 'LOGOUT' ? 'User logout event - no data changes' :
                          selectedAuditDetails.action === 'LOGIN_FAILED' ? 'Failed login attempt - no data changes' :
                            selectedAuditDetails.action === 'CREATE' ? `${selectedAuditDetails.entity_type} was created` :
                              selectedAuditDetails.action === 'DELETE' ? `${selectedAuditDetails.entity_type} was deleted` :
                                'No detailed change information available'}
                    </p>
                    {(Object.keys(selectedAuditDetails.oldValue).length > 0 || Object.keys(selectedAuditDetails.newValue).length > 0) &&
                      selectedAuditDetails.action !== 'LOGIN' && selectedAuditDetails.action !== 'LOGOUT' && (
                        <p className="text-xs text-gray-500 mt-2">View complete details below to see all field values</p>
                      )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {Object.entries(selectedAuditDetails.details).map(([key, val]) => {
                      // Determine icon based on field type
                      let icon = '📝';
                      const keyLower = key.toLowerCase();

                      if (keyLower.includes('status')) {
                        icon = val.new === 'resolved' ? '✅' : val.new === 'in-progress' ? '⚙️' : '🔄';
                      } else if (keyLower.includes('risk')) {
                        icon = '⚠️';
                      } else if (keyLower.includes('role')) {
                        icon = '👤';
                      } else if (keyLower.includes('email')) {
                        icon = '📧';
                      } else if (keyLower.includes('phone') || keyLower.includes('mobile')) {
                        icon = '📱';
                      } else if (keyLower.includes('name')) {
                        icon = '✏️';
                      } else if (keyLower.includes('department')) {
                        icon = '🏢';
                      } else if (keyLower.includes('branch')) {
                        icon = '📍';
                      } else if (keyLower.includes('time')) {
                        icon = '⏰';
                      } else if (keyLower.includes('assign')) {
                        icon = '👥';
                      }

                      // Format display key
                      const displayKey = key.replace(/_/g, ' ').split(' ').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');

                      // Handle different value structures
                      const oldValue = val.old !== undefined ? val.old : (val.old_value !== undefined ? val.old_value : 'Not set');
                      const newValue = val.new !== undefined ? val.new : (val.new_value !== undefined ? val.new_value : 'Not set');

                      return (
                        <div key={key} className="bg-gray-800 rounded-xl p-3 shadow-md border border-gray-700 hover:border-gray-600 transition-all">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                            <span className="text-base">{icon}</span>
                            <p className="text-sm font-bold text-gray-200">{displayKey}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 bg-red-500/10 rounded-lg p-2 border border-red-500/30">
                              <p className="text-xs font-semibold text-red-400 mb-1">Before</p>
                              <p className="text-sm font-medium text-gray-300 break-words">
                                {oldValue === 'Not set' || oldValue === null || oldValue === undefined || oldValue === '' ? (
                                  <span className="text-gray-500 italic">Not set</span>
                                ) : (
                                  String(oldValue)
                                )}
                              </p>
                            </div>
                            <div className="text-gray-500 text-xl">→</div>
                            <div className="flex-1 bg-green-500/10 rounded-lg p-2 border border-green-500/30">
                              <p className="text-xs font-semibold text-green-400 mb-1">After</p>
                              <p className="text-sm font-bold text-green-300 break-words">
                                {newValue === 'Not set' || newValue === null || newValue === undefined || newValue === '' ? (
                                  <span className="text-gray-500 italic">Not set</span>
                                ) : (
                                  String(newValue)
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary text - only show if present and not empty */}
                {selectedAuditDetails.summary && selectedAuditDetails.summary !== 'null' && selectedAuditDetails.summary !== '' && (
                  <div className="mt-4 pt-3 border-t border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 bg-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info size={12} className="text-amber-400" />
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-semibold text-amber-400">Summary:</span> {selectedAuditDetails.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* User info for who made the change */}
                <div className="mt-3 pt-2 text-xs text-gray-500 border-t border-amber-500/10">
                  <span className="font-medium">Changed by:</span> {selectedAuditDetails.user_name || selectedAuditDetails.user_email || 'System'}
                  {selectedAuditDetails.timestamp && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{new Date(selectedAuditDetails.timestamp).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Complete Details - Before & After */}
              {(Object.keys(selectedAuditDetails.oldValue).length > 0 || Object.keys(selectedAuditDetails.newValue).length > 0) && (
                <div className="flex flex-col md:flex-row">
                  {/* Left Side - All Old Values */}
                  <div className="flex-1 p-5 border-r border-gray-700">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-500/30 sticky top-0 bg-gray-800 z-10">
                      <div className="h-7 w-7 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertCircle size={14} className="text-red-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">Complete Details (Before)</h4>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(selectedAuditDetails.oldValue).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No old data available</p>
                        </div>
                      ) : (
                        Object.entries(selectedAuditDetails.oldValue).map(([key, value]) => {
                          const displayKey = key.replace(/_/g, ' ').split(' ').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                          const hasChanged = selectedAuditDetails.details[key] ||
                            Object.keys(selectedAuditDetails.details).some(k =>
                              k.toLowerCase() === key.toLowerCase() ||
                              k.toLowerCase().replace(/ /g, '_') === key.toLowerCase() ||
                              k.toLowerCase().replace(/_/g, ' ') === key.toLowerCase()
                            );
                          return (
                            <div key={key} className={`rounded-xl p-3 border ${hasChanged ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30' : 'bg-gray-700/40 border-gray-600/60'}`}>
                              <p className="text-xs font-semibold text-gray-400 mb-1">{displayKey}</p>
                              <p className={`text-sm break-words ${hasChanged ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
                                {value === 'Not set' || !value ? (
                                  <span className="text-gray-500 italic">Not set</span>
                                ) : (
                                  String(value)
                                )}
                              </p>
                              {hasChanged && (
                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  Changed
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Center Arrow */}
                  <div className="hidden md:flex items-center justify-center p-4 text-gray-500 bg-gray-800/60">
                    <div className="text-3xl font-bold">→</div>
                  </div>

                  {/* Right Side - All New Values */}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-500/30 sticky top-0 bg-gray-800 z-10">
                      <div className="h-7 w-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle size={14} className="text-green-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">Complete Details (After)</h4>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(selectedAuditDetails.newValue).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No new data available</p>
                        </div>
                      ) : (
                        Object.entries(selectedAuditDetails.newValue).map(([key, value]) => {
                          const displayKey = key.replace(/_/g, ' ').split(' ').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                          const hasChanged = selectedAuditDetails.details[key] ||
                            Object.keys(selectedAuditDetails.details).some(k =>
                              k.toLowerCase() === key.toLowerCase() ||
                              k.toLowerCase().replace(/ /g, '_') === key.toLowerCase() ||
                              k.toLowerCase().replace(/_/g, ' ') === key.toLowerCase()
                            );
                          return (
                            <div key={key} className={`rounded-xl p-3 border ${hasChanged ? 'bg-green-500/10 border-green-500/40 ring-1 ring-green-500/30' : 'bg-gray-700/40 border-gray-600/60'}`}>
                              <p className="text-xs font-semibold text-gray-400 mb-1">{displayKey}</p>
                              <p className={`text-sm break-words ${hasChanged ? 'font-bold text-green-300' : 'text-gray-400'}`}>
                                {value === 'Not set' || !value ? (
                                  <span className="text-gray-500 italic">Not set</span>
                                ) : (
                                  String(value)
                                )}
                              </p>
                              {hasChanged && (
                                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                  Changed
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* If no complete details available */}
              {Object.keys(selectedAuditDetails.oldValue).length === 0 && Object.keys(selectedAuditDetails.newValue).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No detailed before/after data available for this audit record</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-700 bg-gray-800/80 rounded-b-2xl flex-shrink-0">
              <button onClick={() => setSelectedAuditDetails(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all hover:scale-105 font-semibold text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0);   opacity:1; } }
        @keyframes scale-up  { from { transform:scale(0.95);       opacity:0; } to { transform:scale(1);        opacity:1; } }
        @keyframes fade-in   { from { opacity:0; } to { opacity:1; } }
        .animate-slide-in  { animation: slide-in  0.35s ease-out; }
        .animate-scale-up  { animation: scale-up  0.25s ease-out; }
        .animate-fade-in   { animation: fade-in   0.2s ease-out; }
        .custom-scrollbar::-webkit-scrollbar       { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        select option { background-color: #374151; color: #f3f4f6; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      `}</style>
    </div>
  );
}