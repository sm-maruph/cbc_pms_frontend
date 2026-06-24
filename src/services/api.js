// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api";  //https://stilt-ardently-recoup.ngrok-free.dev/api
import { isTokenExpired } from '../utils/jwtUtils';

// Helper to get headers with ngrok skip
const getHeaders = (token) => {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'  // ✅ ADD THIS - Required for ngrok free tier
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const request = async (endpoint, method = 'GET', body = null, token = null) => {
    console.log(`Request: ${method} ${endpoint}, token: ${token ? 'present' : 'missing'}`);
    const options = {
        method,
        headers: getHeaders(token)
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        throw error;
    }
};

// Helper to get token and check expiration
const getValidToken = () => {
    const token = localStorage.getItem('cbcToken');
    if (token && isTokenExpired(token)) {
        // Token expired - clear storage and throw error
        localStorage.removeItem('cbcToken');
        localStorage.removeItem('cbcUser');
        throw new Error('SESSION_EXPIRED');
    }
    return token;
};

// Enhanced fetch with token expiration check
const authFetch = async (url, options = {}) => {
    try {
        const token = getValidToken();

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('cbcToken');
            localStorage.removeItem('cbcUser');
            window.dispatchEvent(new CustomEvent('auth:logout'));
            throw new Error('SESSION_EXPIRED');
        }

        return response;
    } catch (error) {
        if (error.message === 'SESSION_EXPIRED') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        throw error;
    }
};

// // Example API call using authFetch
// export const getDashboardStats = async (token, dateFilter = 'all') => {
//   const response = await authFetch(`/dashboard/stats?dateFilter=${dateFilter}`, {
//     method: 'GET',
//   });
//   if (!response.ok) throw new Error('Failed to fetch stats');
//   return response.json();
// };

// Auth
export const login = (email, password) => request('/auth/login', 'POST', { email, password });

// Logout - invalidate token and log the event
export const logout = async (token) => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
};

// Tickets
export const getTickets = (token) => request('/tickets', 'GET', null, token);
export const getMyTickets = (token) => request('/tickets/my', 'GET', null, token);
export const createTicket = (ticketData, token) => request('/tickets', 'POST', ticketData, token);
export const updateTicket = (id, updates, token) => request(`/tickets/${id}`, 'PUT', updates, token);
export const deleteTicket = (id, token) => request(`/tickets/${id}`, 'DELETE', null, token);
export const getTicketBySL = (ticket_sl, token) => request(`/tickets/sl/${ticket_sl}`, 'GET', null, token);

// Dashboard stats - Updated with ngrok header
export const getDashboardStats = async (token, dateFilter = 'all') => {
    const response = await fetch(`${API_BASE}/tickets/stats?dateFilter=${dateFilter}`, {
        headers: getHeaders(token)  // ✅ Use the helper function
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
};

export const getPaginatedTickets = async (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/tickets/paginated?${queryParams}`, {
        headers: getHeaders(token)  // ✅ Use the helper function
    });
    if (!response.ok) throw new Error('Failed to fetch paginated tickets');
    return response.json();
};

// ✅ NEW: Get top 10 systems (styled like existing APIs)
export const getTopSystems = async (token, dateFilter = 'all') => {
    const response = await fetch(`${API_BASE}/tickets/dashboard/top-systems?dateFilter=${dateFilter}`, {
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to fetch top systems');
    return response.json();
};

// ✅ NEW: Get currently down ATMs (styled like existing APIs)
export const getDownAtms = async (token) => {
    const response = await fetch(`${API_BASE}/tickets/dashboard/down-atms`, {
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to fetch down ATMs');
    return response.json();
};



// Reports
export const getReportData = (range, startDate, endDate, token) => {
    let url = `/reports?range=${range}`;
    if (range === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return request(url, 'GET', null, token);
};

// Users - Regular users (for assignment dropdown)
export const getAssignableUsers = (token) => request('/users/assignable', 'GET', null, token);

// Admin users (full user management)
export const getUsers = (token) => request('/users', 'GET', null, token);
export const createUser = (userData, token) => request('/users', 'POST', userData, token);
export const updateUser = (id, userData, token) => request(`/users/${id}`, 'PUT', userData, token);
export const deleteUser = (id, token) => request(`/users/${id}`, 'DELETE', null, token);

// Get current user profile
export const getCurrentUser = (token) => request('/auth/me', 'GET', null, token);

// Update user profile (for regular users)
export const updateUserProfile = (userData, token) => request('/auth/profile', 'PUT', userData, token);

// ============================================================
// Systems CRUD
// ============================================================
export const getSystems = (token) => request('/static/systems', 'GET', null, token);
export const createSystem = (name, token) => request('/static/systems', 'POST', { name }, token);
export const updateSystem = (id, data, token) => request(`/static/systems/${id}`, 'PUT', data, token);
export const deleteSystem = (id, token) => request(`/static/systems/${id}`, 'DELETE', null, token);

// ============================================================
// Departments CRUD
// ============================================================
export const getDepartments = (token) => request('/static/departments', 'GET', null, token);
export const createDepartment = (name, token) => request('/static/departments', 'POST', { name }, token);
export const updateDepartment = (id, data, token) => request(`/static/departments/${id}`, 'PUT', data, token);
export const deleteDepartment = (id, token) => request(`/static/departments/${id}`, 'DELETE', null, token);

// ============================================================
// Branches CRUD
// ============================================================
export const getBranches = (token) => request('/static/branches', 'GET', null, token);
export const createBranch = (name, token) => request('/static/branches', 'POST', { name }, token);
export const updateBranch = (id, data, token) => request(`/static/branches/${id}`, 'PUT', data, token);
export const deleteBranch = (id, token) => request(`/static/branches/${id}`, 'DELETE', null, token);

// ============================================================
// Templates CRUD
// ============================================================
export const getTemplates = (token) => request('/static/templates', 'GET', null, token);
export const createTemplate = (templateData, token) => request('/static/templates', 'POST', templateData, token);
export const updateTemplate = (id, templateData, token) => request(`/static/templates/${id}`, 'PUT', templateData, token);
export const deleteTemplate = (id, token) => request(`/static/templates/${id}`, 'DELETE', null, token);

// ============================================================
// User Favorites
// ============================================================
export const getUserFavorites = (token) => request('/static/favorites', 'GET', null, token);
export const toggleFavorite = (templateId, token) => request(`/static/favorites/${templateId}`, 'POST', null, token);

// ============================================================
// Dashboard Statistics
// ============================================================
export const getTicketStats = (token) => request('/stats/tickets', 'GET', null, token);
export const getRiskStats = (token) => request('/stats/risk', 'GET', null, token);

// ============================================================
// Notifications
// ============================================================
// returns the array for simple callers; pass wantMeta=true to get {data, pagination}
export const getNotifications = async (token, limit = 50, offset = 0, wantMeta = false) => {
    const res = await request(`/notifications?limit=${limit}&offset=${offset}`, 'GET', null, token);
    return wantMeta ? res : (res.data || []);
};

export const getUnreadCount = async (token) => {
    return request('/notifications/unread-count', 'GET', null, token);
};

export const markNotificationRead = async (id, token) => {
    return request(`/notifications/${id}/read`, 'PUT', null, token);
};

export const markAllNotificationsRead = async (token) => {
    return request('/notifications/mark-all-read', 'PUT', null, token);
};

// ============================================================
// Bulk Import
// ============================================================
export const validateBulkTickets = async (ticketsData, token) => {
    return request('/tickets/bulk-import/validate', 'POST', ticketsData, token);
};

export const bulkImportTickets = async (ticketsData, token) => {
    return request('/tickets/bulk-import', 'POST', ticketsData, token);
};


/// ============================================================
// Announcements CRUD - Add this section to your api.js
// ============================================================
export const getAnnouncements = async (token) => {
    return request('/announcements', 'GET', null, token);
};

export const getActiveAnnouncements = async (token) => {
    return request('/announcements/active', 'GET', null, token);
};

export const createAnnouncement = async (data, token) => {
    return request('/announcements', 'POST', data, token);
};

export const updateAnnouncement = async (id, data, token) => {
    return request(`/announcements/${id}`, 'PUT', data, token);
};

export const deleteAnnouncement = async (id, token) => {
    return request(`/announcements/${id}`, 'DELETE', null, token);
};

export const toggleAnnouncementStatus = async (id, token) => {
    return request(`/announcements/${id}/toggle`, 'PATCH', null, token);
};



// ============================================================
// AUDIT TRAIL (Admin only)
// ============================================================

// Get audit logs with pagination
export const getAuditLogs = async (token, filters = {}, page = 1, pageSize = 20) => {
    const queryParams = new URLSearchParams({
        page: page,
        pageSize: pageSize,
        ...(filters.action_type && { action_type: filters.action_type }),
        ...(filters.entity_type && { entity_type: filters.entity_type }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
    });

    const response = await fetch(`${API_BASE}/audit?${queryParams}`, {
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
};

// Get recent activities (for widget)
export const getRecentActivities = async (token, limit = 10) => {
    const response = await fetch(`${API_BASE}/audit/recent?limit=${limit}`, {
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to fetch recent activities');
    return response.json();
};

// Get audit summary (stats cards - no pagination)
export const getAuditSummary = async (token) => {
    const response = await fetch(`${API_BASE}/audit/summary`, {
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to fetch audit summary');
    return response.json();
};

// Get audit logs for specific entity (e.g., ticket ID, user ID)
export const getAuditLogsByEntity = async (token, entityType, entityId) => {
    return request(`/audit/entity/${entityType}/${entityId}`, 'GET', null, token);
};

// Get user activity statistics (online users, active time, etc.)
export const getUserActivityStats = async (token) => {
    return request('/users/activity-stats', 'GET', null, token);
};

// Add to your existing api.js file

// Get current user's permissions
export const getUserPermissions = async (token) => {
    try {
        const response = await fetch(`${API_BASE}/auth/my-permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return { permissions: [], role_id: null };
    }
};


export const getMyPermissions = (token) =>
    request('/auth/my-permissions', 'GET', null, token);

export const getRoles = (token) =>
    request('/admin/roles', 'GET', null, token);

export const getPermissions = (token) =>
    request('/admin/permissions', 'GET', null, token);

export const getRolePermissions = (roleId, token) =>
    request(`/admin/roles/${roleId}/permissions`, 'GET', null, token);

export const updateRolePermissions = (roleId, permissionIds, token) =>
    request(`/admin/roles/${roleId}/permissions`, 'PUT', { permission_ids: permissionIds }, token);

export const assignUserRole = (userId, roleId, token) =>
    request(`/admin/users/${userId}/role`, 'PUT', { role_id: roleId }, token);

export const createRole = (data, token) =>
    request('/admin/roles', 'POST', data, token);

export const deleteRole = (roleId, token) =>
    request(`/admin/roles/${roleId}`, 'DELETE', null, token);