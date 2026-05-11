import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, Calendar, User, Server, AlertCircle, CheckCircle,
  Activity, Zap, FileText, Plus, X, ChevronDown, ChevronUp,
  Monitor, Database, Wifi,
  Printer, Mail, Shield, Globe, CreditCard, Smartphone,
  Download, Copy, Trash2, Edit, Filter, Search, Star, StarOff,
  Layers, ChevronLeft, ChevronRight, Menu, MapPin, Cpu
} from "lucide-react";

// Import the API function
import { createTicket } from "../../services/api";

const defaultUsers = [
  { email: "cito@cbc.com", name: "CITO" },
  { email: "tanim@cbc.com", name: "Tanim Mahmud" },
  { email: "eazuddin@cbc.com", name: "Eaz Uddin" },
  { email: "jahidul@cbc.com", name: "Jahidul Balat" },
  { email: "supriya@cbc.com", name: "Supriya Das Gupta" },
  { email: "sifat@cbc.com", name: "Sifat Nur Billah" },
  { email: "salman@cbc.com", name: "Salman Ahmed" },
  { email: "abubakar@cbc.com", name: "Abu Bakar Siddiq" },
  { email: "shah@cbc.com", name: "Shah Mohammad Al Noor" },
  { email: "sm.maruph@cbc.com", name: "S. M. Maruph" },
  { email: "raiyan@cbc.com", name: "Raiyan" },
  { email: "tudu@cbc.com", name: "Tudu" },
];

// PC Name prefix to branch mapping
const pcBranchMapping = {
  "cbccor": "Corporate Branch",
  "cht": "Agrabad Branch",
  "mtj": "Motijheel Branch",
  "dha": "Dhanmondi Branch",
  "corcrr": "Gulshan Branch",
  "cbccard": "Gulshan Branch",
  "gul": "Gulshan Branch",
  "mrp": "Mirpur Branch",
  "nrj": "Narayanganj Branch",
  "snr": "Panthapath Branch",
  "syl": "Sylhet Branch",
  "utt": "Uttara Branch",
  "tjn": "Tejgaon Branch",
  "sod": "SME Old Dhaka",
  "ssn": "SME Shantinagar",
  "scc": "SME CDA Avenue",
  "sps": "SME Pragati Sharani",
  "stg": "SME Tongi",
  "sch": "SME Jubli",
  "ueb": "US Embassy Sub Branch",
  "cepz": "CEPZ Sub Branch",
  "depz": "DEPZ Sub Branch",
  "hob": "Head Office BD",
};

// Templates extracted from the Excel data (actual issues from the log)
const quickTemplates = [
  {
    id: "template-1",
    name: "ICBS Access Denied",
    icon: Shield,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    category: "Access Issue",
    data: {
      systemName: "ICBS",
      department: "Treasury Back Office",
      problemDetails: "Access denied issue. User unable to login to ICBS system. Error message indicates session device limit reached or authentication failure.",
      riskLabel: "HIGH",
      affectedUser: "TBO officials",
    }
  },
  {
    id: "template-2",
    name: "Branch Network Down",
    icon: Wifi,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    category: "Network Issue",
    data: {
      systemName: "Branch Network",
      department: "Operations",
      problemDetails: "Complete branch network outage. Users cannot connect to internal banking applications. Branch operations fully halted.",
      riskLabel: "HIGH",
      affectedUser: "Full Branch Users",
    }
  },
  {
    id: "template-3",
    name: "T4S Printing Error",
    icon: Printer,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    category: "Printing Issue",
    data: {
      systemName: "T4S NEXUS",
      department: "Customer Service",
      problemDetails: "Unable to print from T4S system. Voucher prints were not coming out. CCB Error showing in the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Cash Counter Users",
    }
  },
  {
    id: "template-4",
    name: "Email Login Failure",
    icon: Mail,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    category: "Login Issue",
    data: {
      systemName: "Corporate Email",
      department: "IT",
      problemDetails: "Unable to login to email. 2-factor authentication not working or password sync issue. Cannot access critical communications.",
      riskLabel: "HIGH",
      affectedUser: "All Dept Users",
    }
  },
  {
    id: "template-5",
    name: "BACH & BEFTN File Issue",
    icon: Database,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    category: "Clearing Issue",
    data: {
      systemName: "BACH & BEFTN",
      department: "Central Clearing",
      problemDetails: "Outward file NACK issue / ACK not received. Files not getting acknowledged by the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Clearing Department",
    }
  },
  {
    id: "template-6",
    name: "Profile Lock / AD Lock",
    icon: Activity,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    category: "AD Issue",
    data: {
      systemName: "Active Directory",
      department: "Customer Service",
      problemDetails: "User profile getting locked frequently. Unable to login to PC due to AD lock issue. Password needs reset.",
      riskLabel: "MEDIUM",
      affectedUser: "Branch Users",
    }
  },
  {
    id: "template-7",
    name: "ICBS Session Device Limit",
    icon: Monitor,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    category: "Session Issue",
    data: {
      systemName: "ICBS Session",
      department: "Customer Service",
      problemDetails: "Reached session device limit. User cannot login to AS400 due to multiple active sessions.",
      riskLabel: "MEDIUM",
      affectedUser: "Branch User",
    }
  },
  {
    id: "template-8",
    name: "Share Folder Access",
    icon: Server,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    category: "Access Issue",
    data: {
      systemName: "Share Folder",
      department: "Customer Service",
      problemDetails: "Unable to access share folder / network drive. Permission issue or security patch causing access denied.",
      riskLabel: "LOW",
      affectedUser: "Branch Staff",
    }
  },
  {
    id: "template-9",
    name: "AMlock Login Issue",
    icon: Shield,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    category: "Login Issue",
    data: {
      systemName: "AMlock Profile Setup",
      department: "Trade Finance",
      problemDetails: "Unable to login to AMLOCK due to compatibility issue. Functions not showing after login.",
      riskLabel: "LOW",
      affectedUser: "Finance Users",
    }
  },
  {
    id: "template-10",
    name: "Excel File Corruption",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    category: "Application Issue",
    data: {
      systemName: "Microsoft Office",
      department: "Finance & Accounts",
      problemDetails: "Unable to open Excel files from D drive. File corrupted or security patch causing access issue.",
      riskLabel: "MEDIUM",
      affectedUser: "Accounts Department",
    }
  },
  {
    id: "template-11",
    name: "ATM Out of Service",
    icon: CreditCard,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    category: "ATM Issue",
    data: {
      systemName: "ATM",
      department: "ATM Operations",
      problemDetails: "ATM showing blank screen / card reader error / cash dispenser error. Customers unable to withdraw cash.",
      riskLabel: "HIGH",
      affectedUser: "ATM Customers",
    }
  },
  {
    id: "template-12",
    name: "Scanner Not Working",
    icon: Smartphone,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    category: "Hardware Issue",
    data: {
      systemName: "Scanner",
      department: "Customer Service",
      problemDetails: "Unable to scan cheques due to connectivity issue. Scanner not detected by the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Clearing Staff",
    }
  }
];

export default function CreateTicket({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTemplate, setSearchTemplate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [detectedBranch, setDetectedBranch] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteTemplates");
    return saved ? JSON.parse(saved) : ["template-1", "template-4", "template-6"];
  });


  // Initialize downtime with current date and time
 const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

   const [formData, setFormData] = useState({
    affectedUser: "",
    assignedTo: "",
    systemName: "",
    problemDetails: "",
    department: "",
    branch: "",
    riskLabel: "LOW",
    pcName: "",
    date: new Date().toISOString().split("T")[0],
    downTime: getCurrentDateTime(),
  });


  const [systemOptions, setSystemOptions] = useState(() => {
    const stored = localStorage.getItem("cbcSystems");
    const defaultSystems = ["ICBS", "T4S NEXUS", "BACH & BEFTN", "Email Server", "Core Banking", "ERP System", "Network", "ATM", "AMlock", "Active Directory", "Share Folder", "FX Portal", "LOS", "SWIFT", "EXIMBILL"];
    return stored ? JSON.parse(stored) : defaultSystems;
  });

  const [departmentOptions, setDepartmentOptions] = useState(() => {
    const stored = localStorage.getItem("cbcDepartments");
    const defaultDepts = ["IT", "Finance & Accounts", "Operations", "HR", "Compliance", "Customer Service", "Trade Finance", "Treasury Back Office", "Treasury Front Office", "Central Clearing", "Corporate Banking", "Digital Banking", "ICC", "IRMD", "Credit Admin", "Branch Operations"];
    return stored ? JSON.parse(stored) : defaultDepts;
  });

  const [branchOptions, setBranchOptions] = useState(() => {
    const stored = localStorage.getItem("cbcBranches");
    const defaultBranches = [
      "Head Office BD",
      "Corporate Branch",
      "Agrabad Branch",
      "Motijheel Branch",
      "Dhanmondi Branch",
      "Gulshan Branch",
      "Mirpur Branch",
      "Narayanganj Branch",
      "Panthapath Branch",
      "Sylhet Branch",
      "Uttara Branch",
      "Tejgaon Branch",
      "SME Old Dhaka",
      "SME Shantinagar",
      "SME CDA Avenue",
      "SME Pragati Sharani",
      "SME Tongi",
      "SME Jubli",
      "US Embassy Sub Branch",
      "CEPZ Sub Branch",
      "DEPZ Sub Branch"
    ];
    return stored ? JSON.parse(stored) : defaultBranches;
  });

  // Function to detect branch from PC name
  const detectBranchFromPC = (pcName) => {
    if (!pcName || pcName.trim() === "") {
      setDetectedBranch(null);
      return;
    }

    const cleanPCName = pcName.trim().toLowerCase();
    
    // Try to match PC name prefixes (case insensitive)
    for (const [prefix, branch] of Object.entries(pcBranchMapping)) {
      if (cleanPCName.includes(prefix.toLowerCase())) {
        setDetectedBranch(branch);
        setFormData(prev => ({ ...prev, branch: branch }));
        return;
      }
    }
    
    // Default to Head Office BD if no match found
    setDetectedBranch("Head Office BD");
    setFormData(prev => ({ ...prev, branch: "Head Office BD" }));
  };

  const availableUsers = useMemo(() => {
    const stored = localStorage.getItem("cbcUsers");
    const usersMap = new Map();

    if (stored) {
      JSON.parse(stored).forEach((u) => {
        if (u.email) {
          usersMap.set(u.email, { email: u.email, name: u.name });
        }
      });
    }

    defaultUsers.forEach((u) => usersMap.set(u.email, u));
    if (user?.email) {
      usersMap.set(user.email, { email: user.email, name: user.name });
    }

    return Array.from(usersMap.values());
  }, [user]);

  const riskLevels = ["LOW", "MEDIUM", "HIGH"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-detect branch when PC name changes
    if (name === "pcName") {
      detectBranchFromPC(value);
    }
  };

  const handleApplyTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      systemName: template.data.systemName,
      department: template.data.department,
      problemDetails: template.data.problemDetails,
      riskLabel: template.data.riskLabel,
      affectedUser: template.data.affectedUser || prev.affectedUser,
    }));
    // Close mobile sidebar if open
    setMobileSidebarOpen(false);
    // Scroll to form on mobile
    if (window.innerWidth < 1024) {
      document.getElementById("ticket-form")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const setCurrentTimeAsDownTime = () => {
    setFormData(prev => ({ ...prev, downTime: getCurrentDateTime() }));
  };

  const filteredTemplates = useMemo(() => {
    return quickTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        template.data.systemName.toLowerCase().includes(searchTemplate.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTemplate, selectedCategory]);

  const favoriteTemplates = quickTemplates.filter(t => favorites.includes(t.id));
  const otherTemplates = filteredTemplates.filter(t => !favorites.includes(t.id));

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation (unchanged)
    if (!formData.systemName.trim()) {
      setError("System Name is required");
      setLoading(false);
      return;
    }
    if (!formData.problemDetails.trim()) {
      setError("Problem Details are required");
      setLoading(false);
      return;
    }
    if (!formData.department) {
      setError("Department is required");
      setLoading(false);
      return;
    }
    if (!formData.branch) {
      setError("Branch is required");
      setLoading(false);
      return;
    }
    if (!formData.affectedUser.trim()) {
      setError("Affected User is required");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("cbcToken");
    if (!token) {
      setError("You are not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    // Build the payload matching your backend schema
    const ticketData = {
      date: formData.date,
      systemName: formData.systemName,
      problemDetails: formData.problemDetails,
      department: formData.department,
      branch: formData.branch,
      riskLabel: formData.riskLabel,
      affectedUser: formData.affectedUser,
      assignedToEmail: formData.assignedTo || null,
      pcName: formData.pcName || "",
      downTime: formData.downTime,
      // reportedByEmail will be taken from the JWT token by the backend
    };

    try {
      await createTicket(ticketData, token);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Ticket creation error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Ticket
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Layers size={20} className="text-blue-600" />
                  Templates
                </h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <TemplateSidebar
                searchTemplate={searchTemplate}
                setSearchTemplate={setSearchTemplate}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                favoriteTemplates={favoriteTemplates}
                otherTemplates={otherTemplates}
                favorites={favorites}
                onApplyTemplate={handleApplyTemplate}
                onToggleFavorite={(id) => {
                  setFavorites(prev => {
                    const newFavs = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
                    localStorage.setItem("favoriteTemplates", JSON.stringify(newFavs));
                    return newFavs;
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar - 1/6 width */}
        <div className={`hidden lg:block bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-1/6 min-w-[280px]'}`}>
          {sidebarCollapsed ? (
            <div className="h-full flex flex-col items-center pt-6">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 hover:bg-blue-50 rounded-lg transition mb-4"
                title="Expand Templates"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
              <div className="flex flex-col items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Layers size={20} className="text-white" />
                </div>
                <span className="text-xs text-gray-500 writing-vertical">Templates</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Layers size={16} className="text-white" />
                    </div>
                    Templates
                  </h2>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-1 hover:bg-white/50 rounded-lg transition"
                    title="Collapse Templates"
                  >
                    <ChevronLeft size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TemplateSidebar
                  searchTemplate={searchTemplate}
                  setSearchTemplate={setSearchTemplate}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  favoriteTemplates={favoriteTemplates}
                  otherTemplates={otherTemplates}
                  favorites={favorites}
                  onApplyTemplate={handleApplyTemplate}
                  onToggleFavorite={(id) => {
                    setFavorites(prev => {
                      const newFavs = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
                      localStorage.setItem("favoriteTemplates", JSON.stringify(newFavs));
                      return newFavs;
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content - 5/6 width */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create Incident Ticket
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  Fill in the details below to report a new IT incident
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-xl transition border border-gray-200"
              >
                <X size={18} />
                Back to Dashboard
              </button>
            </div>

            {/* Ticket Form */}
            <div id="ticket-form" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-pulse">
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle size={18} />
                    Ticket created successfully!
                  </p>
                  <p className="text-sm">Redirecting to dashboard...</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </p>
                </div>
              )}

              {selectedTemplate && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" />
                    <p className="text-sm font-medium">Template Applied: {selectedTemplate.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Row 1: Affected User & PC Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      Affected User <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="affectedUser"
                      value={formData.affectedUser}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                      placeholder="Employee name, ID or role"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Cpu size={16} className="text-indigo-500" />
                      Affected PC Name
                    </label>
                    <input
                      type="text"
                      name="pcName"
                      value={formData.pcName}
                      onChange={handleChange}
                      placeholder="e.g., CBCMRP01 or CORLAPTOP01"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white transition-all"
                    />
                    {detectedBranch && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        Auto-detected: {detectedBranch}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: System Name & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Server size={16} className="text-purple-500" />
                      System Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="systemName"
                      value={formData.systemName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a system</option>
                      {systemOptions.map((system) => (
                        <option key={system} value={system}>{system}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Database size={16} className="text-cyan-500" />
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Branch & Assigned To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-green-500" />
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User size={16} className="text-violet-500" />
                      Assigned To
                    </label>
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none bg-white transition-all"
                    >
                      <option value="">Unassigned</option>
                      {availableUsers.map((u) => (
                        <option key={u.email} value={u.email}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Report Date, Risk Level & Down Time in one row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar size={16} className="text-pink-500" />
                      Report Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none bg-white transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-500" />
                      Risk Level <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {riskLevels.map((risk) => (
                        <label key={risk} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="riskLabel"
                            value={risk}
                            checked={formData.riskLabel === risk}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all group-hover:scale-105 ${
                            risk === "HIGH" ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300" :
                            risk === "MEDIUM" ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-300" :
                            "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
                          }`}>
                            {risk}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      Down Time <span className="text-gray-400 text-xs font-normal">(When issue started)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="downTime"
                        value={formData.downTime}
                        onChange={handleChange}
                        placeholder="DD/MM/YYYY, HH:MM:SS AM/PM"
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={setCurrentTimeAsDownTime}
                        className="px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition flex items-center gap-1 text-sm font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <Clock size={16} />
                        Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Problem Details */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-teal-500" />
                    Problem Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="problemDetails"
                    value={formData.problemDetails}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none bg-white transition-all"
                    placeholder="Describe the problem in detail. Include error messages, steps to reproduce, and business impact."
                    required
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Creating Ticket..." : "Create Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl transition-all border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}

// Template Sidebar Component
function TemplateSidebar({ searchTemplate, setSearchTemplate, selectedCategory, setSelectedCategory, favoriteTemplates, otherTemplates, favorites, onApplyTemplate, onToggleFavorite }) {
  const categories = [...new Set([...favoriteTemplates, ...otherTemplates].map(t => t.category))];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTemplate}
          onChange={(e) => setSearchTemplate(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Category Filter */}
      <div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Favorite Templates */}
      {favoriteTemplates.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            Favorites
          </h3>
          <div className="space-y-1.5">
            {favoriteTemplates.map((template) => (
              <TemplateCardCompact
                key={template.id}
                template={template}
                isFavorite={true}
                onSelect={() => onApplyTemplate(template)}
                onToggleFavorite={() => onToggleFavorite(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Templates */}
      {otherTemplates.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            All Templates
          </h3>
          <div className="space-y-1.5">
            {otherTemplates.map((template) => (
              <TemplateCardCompact
                key={template.id}
                template={template}
                isFavorite={favorites.includes(template.id)}
                onSelect={() => onApplyTemplate(template)}
                onToggleFavorite={() => onToggleFavorite(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {favoriteTemplates.length === 0 && otherTemplates.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <FileText size={24} className="mx-auto mb-2" />
          <p className="text-xs">No templates found</p>
        </div>
      )}
    </div>
  );
}

// Compact Template Card for Sidebar
function TemplateCardCompact({ template, isFavorite, onSelect, onToggleFavorite }) {
  const Icon = template.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full group rounded-lg border border-gray-200 p-3 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
    >
      <div className="flex items-start gap-2">
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="font-medium text-gray-900 text-xs truncate">{template.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="text-gray-400 hover:text-yellow-500 transition flex-shrink-0"
            >
              {isFavorite ? <Star size={12} fill="currentColor" className="text-yellow-500" /> : <Star size={12} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{template.data.systemName}</p>
          <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full ${template.bgColor} ${template.textColor} border`}>
            {template.data.riskLabel}
          </span>
        </div>
      </div>
    </button>
  );
}