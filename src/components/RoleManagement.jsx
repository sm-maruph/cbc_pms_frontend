import { useState, useEffect, useCallback } from "react";
import {
  Shield, Plus, Edit, Trash2, Check, X, ChevronDown, ChevronUp,
  Users, Lock, RefreshCw, Save, AlertCircle, CheckCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api"; 
const hdr = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "ngrok-skip-browser-warning": "true",
});

// Colour map for module labels
const MODULE_COLORS = {
  tickets: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  users: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  systems: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  departments: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  branches: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  templates: "bg-green-500/20 text-green-300 border-green-500/30",
  announcements: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  audit: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  reports: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  dashboard: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  activity: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const ROLE_COLORS = [
  "from-violet-600 to-indigo-600",
  "from-indigo-600 to-blue-600",
  "from-blue-600 to-cyan-600",
  "from-teal-600 to-green-600",
  "from-amber-600 to-orange-600",
  "from-pink-600 to-rose-600",
];

export default function RoleManagement({ notify, users = [] }) {
  const token = localStorage.getItem("cbcToken");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({}); // grouped
  const [loading, setLoading] = useState(true);

  // Which role is being edited (permissions)
  const [editingRole, setEditingRole] = useState(null);
  const [editPerms, setEditPerms] = useState([]); // selected permission IDs
  const [expandedModules, setExpandedModules] = useState({});
  const [saving, setSaving] = useState(false);

  // Create role modal
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", permission_ids: [] });

  // Assign role to user modal
  const [assignModal, setAssignModal] = useState(null); // { userId, userName, currentRoleId }
  const [assignRoleId, setAssignRoleId] = useState("");

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/roles`, { headers: hdr(token) }),
        fetch(`${API_BASE}/admin/permissions`, { headers: hdr(token) }),
      ]);
      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();
      setRoles(rolesData.data || []);
      setPermissions(permsData.grouped || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Open edit modal ─────────────────────────────────────────────────────────
  const openEditRole = async (role) => {
    setEditingRole(role);
    try {
      const res = await fetch(`${API_BASE}/admin/roles/${role.id}/permissions`, { headers: hdr(token) });
      const data = await res.json();
      setEditPerms((data.data || []).map(p => p.id));
    } catch (e) { setEditPerms([]); }
    // Expand all modules by default
    const expanded = {};
    Object.keys(permissions).forEach(m => { expanded[m] = true; });
    setExpandedModules(expanded);
  };

  const togglePerm = (id) =>
    setEditPerms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleModule = (module, modulePerms) => {
    const ids = modulePerms.map(p => p.id);
    const allOn = ids.every(id => editPerms.includes(id));
    if (allOn) setEditPerms(prev => prev.filter(id => !ids.includes(id)));
    else setEditPerms(prev => [...new Set([...prev, ...ids])]);
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/roles/${editingRole.id}/permissions`, {
        method: "PUT",
        headers: hdr(token),
        body: JSON.stringify({ permission_ids: editPerms }),
      });
      if (!res.ok) throw new Error("Save failed");
      notify("Permissions updated successfully");
      setEditingRole(null);
      fetchAll();
    } catch (e) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Create role ─────────────────────────────────────────────────────────────
  const createRole = async () => {
    if (!newRole.name.trim()) return notify("Role name is required", "error");
    try {
      const res = await fetch(`${API_BASE}/admin/roles`, {
        method: "POST",
        headers: hdr(token),
        body: JSON.stringify(newRole),
      });
      if (!res.ok) throw new Error("Create failed");
      notify(`Role "${newRole.name}" created`);
      setShowCreate(false);
      setNewRole({ name: "", description: "", permission_ids: [] });
      fetchAll();
    } catch (e) { notify(e.message, "error"); }
  };

  // ── Delete role ─────────────────────────────────────────────────────────────
  const deleteRole = async (roleId, roleName) => {
    if (!confirm(`Delete role "${roleName}"? Users will be reassigned to IT User.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
        method: "DELETE", headers: hdr(token),
      });
      if (!res.ok) throw new Error("Delete failed");
      notify(`Role "${roleName}" deleted`);
      fetchAll();
    } catch (e) { notify(e.message, "error"); }
  };

  // ── Assign role to user ─────────────────────────────────────────────────────
  const assignRole = async () => {
    if (!assignRoleId) return notify("Select a role", "error");
    try {
      const res = await fetch(`${API_BASE}/admin/users/${assignModal.userId}/role`, {
        method: "PUT",
        headers: hdr(token),
        body: JSON.stringify({ role_id: parseInt(assignRoleId) }),
      });
      if (!res.ok) throw new Error("Assign failed");
      notify(`Role assigned to ${assignModal.userName}`);
      setAssignModal(null);
      setAssignRoleId("");
    } catch (e) { notify(e.message, "error"); }
  };

  const inputCls = "w-full border border-gray-600 bg-gray-700/60 text-gray-100 placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Roles & Permissions</h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage roles and assign granular permissions to each role.
            Super Admin always has full access.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition text-sm">
            <Plus size={15} /> New Role
          </button>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role, idx) => (
          <div key={role.id}
            className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all hover:-translate-y-0.5 shadow-md">
            {/* Card header */}
            <div className={`bg-gradient-to-r ${ROLE_COLORS[idx % ROLE_COLORS.length]} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield size={17} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{role.name}</h3>
                    {role.is_system ? (
                      <span className="text-xs text-white/60">System Role</span>
                    ) : (
                      <span className="text-xs text-white/60">Custom Role</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEditRole(role)}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">
                    <Edit size={13} className="text-white" />
                  </button>
                  {!role.is_system && (
                    <button onClick={() => deleteRole(role.id, role.name)}
                      className="p-1.5 bg-white/20 hover:bg-red-500/40 rounded-lg transition">
                      <Trash2 size={13} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              {role.description && (
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{role.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Lock size={13} />
                  <span>{role.permission_count} permissions</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users size={13} />
                  <span>{role.user_count} users</span>
                </div>
              </div>
              <button onClick={() => openEditRole(role)}
                className="w-full mt-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl transition">
                Edit Permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Role Assignment Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            <h3 className="font-bold text-white">User Role Assignments</h3>
          </div>
          <p className="text-xs text-gray-500">{users.length} users</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-700/40 border-b border-gray-700">
              {["User", "Email", "Department", "Branch", "Current Role", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-700/70">
              {users.map(u => {
                const userRole = roles.find(r => r.id === u.role_id);
                const roleIdx = roles.indexOf(userRole);
                return (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-200 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.branch || "—"}</td>
                    <td className="px-4 py-3">
                      {userRole ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${ROLE_COLORS[roleIdx % ROLE_COLORS.length]} text-white`}>
                          {userRole.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">No role</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setAssignModal({ userId: u.id, userName: u.name, currentRoleId: u.role_id }); setAssignRoleId(u.role_id || ""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/10 rounded-lg transition">
                        <Shield size={12} /> Change Role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT PERMISSIONS MODAL ── */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-lg">Edit Permissions — {editingRole.name}</h3>
                  <p className="text-xs text-indigo-200">{editPerms.length} permissions selected</p>
                </div>
              </div>
              <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-white/20 rounded-xl transition"><X size={17} className="text-white" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-3 custom-scrollbar">
              {Object.entries(permissions).map(([module, modulePerms]) => {
                const ids = modulePerms.map(p => p.id);
                const selCnt = ids.filter(id => editPerms.includes(id)).length;
                const allOn = selCnt === ids.length;
                const expanded = expandedModules[module];
                const modCls = MODULE_COLORS[module] || "bg-gray-700/40 text-gray-300 border-gray-600";

                return (
                  <div key={module} className="bg-gray-700/30 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Module header */}
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition"
                      onClick={() => setExpandedModules(p => ({ ...p, [module]: !expanded }))}>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${modCls}`}>{module}</span>
                        <span className="text-xs text-gray-400">{selCnt}/{ids.length} selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); toggleModule(module, modulePerms); }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${allOn ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                          {allOn ? "Deselect All" : "Select All"}
                        </button>
                        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Permission checkboxes */}
                    {expanded && (
                      <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-700/50">
                        {modulePerms.map(perm => {
                          const on = editPerms.includes(perm.id);
                          return (
                            <label key={perm.id}
                              className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition ${on ? "bg-indigo-500/10 border border-indigo-500/30" : "hover:bg-gray-700/40 border border-transparent"}`}>
                              <div className={`h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition ${on ? "bg-indigo-600 border-indigo-500" : "bg-gray-600 border-gray-500"} border`}
                                onClick={() => togglePerm(perm.id)}>
                                {on && <Check size={12} className="text-white" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-200 font-mono">{perm.name}</p>
                                {perm.description && <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-700 bg-gray-800/80 rounded-b-2xl flex-shrink-0">
              <button onClick={savePermissions} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition font-semibold text-sm disabled:opacity-50">
                {saving ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Permissions"}
              </button>
              <button onClick={() => setEditingRole(null)}
                className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE ROLE MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="font-bold text-white text-lg">Create New Role</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-700 rounded-xl transition"><X size={17} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className={labelCls}>Role Name <span className="text-red-400">*</span></label>
                <input type="text" value={newRole.name} onChange={e => setNewRole(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Viewer" className={inputCls} /></div>
              <div><label className={labelCls}>Description</label>
                <textarea value={newRole.description} onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Describe what this role can do…" className={inputCls + " resize-none"} /></div>
              <p className="text-xs text-gray-500">
                You can assign specific permissions after creating the role using the Edit Permissions button.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={createRole} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition font-semibold text-sm">
                Create Role
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN ROLE MODAL ── */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="font-bold text-white">Assign Role</h3>
              <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-gray-700 rounded-xl transition"><X size={17} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-400">
                Changing role for: <span className="font-semibold text-white">{assignModal.userName}</span>
              </p>
              <div><label className={labelCls}>New Role</label>
                <select value={assignRoleId} onChange={e => setAssignRoleId(e.target.value)} className={inputCls}>
                  <option value="">Select a role…</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  The user's permissions will change immediately after saving. Their active session will reflect new permissions on next request.
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={assignRole} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2">
                <CheckCircle size={15} /> Assign Role
              </button>
              <button onClick={() => setAssignModal(null)} className="flex-1 border border-gray-600 py-2.5 rounded-xl hover:bg-gray-700 transition text-sm font-semibold text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:4px}
        .custom-scrollbar::-webkit-scrollbar-track{background:#1f2937;border-radius:8px}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#4b5563;border-radius:8px}
        select option{background-color:#374151;color:#f3f4f6}
      `}</style>
    </div>
  );
}
