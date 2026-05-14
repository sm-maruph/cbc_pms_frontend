// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, method = 'GET', body = null, token = null) => {
    console.log(`Request: ${method} ${endpoint}, token: ${token ? 'present' : 'missing'}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
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

// Auth
export const login = (email, password) => request('/auth/login', 'POST', { email, password });

// Tickets
export const getTickets = (token) => request('/tickets', 'GET', null, token);
export const getMyTickets = (token) => request('/tickets/my', 'GET', null, token);
export const createTicket = (ticketData, token) => request('/tickets', 'POST', ticketData, token);
export const updateTicket = (id, updates, token) => request(`/tickets/${id}`, 'PUT', updates, token);
export const deleteTicket = (id, token) => request(`/tickets/${id}`, 'DELETE', null, token);

// ✅ NEW: Get ticket by ticket_sl (for displaying ticket details)
export const getTicketBySL = (ticket_sl, token) => request(`/tickets/sl/${ticket_sl}`, 'GET', null, token);

// Dashboard stats
export const getDashboardStats = (token) => request('/stats', 'GET', null, token);

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

// ✅ NEW: Get current user profile
export const getCurrentUser = (token) => request('/auth/me', 'GET', null, token);

// ✅ NEW: Update user profile (for regular users)
export const updateUserProfile = (userData, token) => request('/auth/profile', 'PUT', userData, token);

// ============================================================
// Systems CRUD
// ============================================================
export const getSystems = () => request('/static/systems', 'GET');
export const createSystem = (name, token) => request('/static/systems', 'POST', { name }, token);
export const updateSystem = (id, data, token) => request(`/static/systems/${id}`, 'PUT', data, token);
export const deleteSystem = (id, token) => request(`/static/systems/${id}`, 'DELETE', null, token);

// ============================================================
// Departments CRUD
// ============================================================
export const getDepartments = () => request('/static/departments', 'GET');
export const createDepartment = (name, token) => request('/static/departments', 'POST', { name }, token);
export const updateDepartment = (id, data, token) => request(`/static/departments/${id}`, 'PUT', data, token);
export const deleteDepartment = (id, token) => request(`/static/departments/${id}`, 'DELETE', null, token);

// ============================================================
// Branches CRUD
// ============================================================
export const getBranches = () => request('/static/branches', 'GET');
export const createBranch = (name, token) => request('/static/branches', 'POST', { name }, token);
export const updateBranch = (id, data, token) => request(`/static/branches/${id}`, 'PUT', data, token);
export const deleteBranch = (id, token) => request(`/static/branches/${id}`, 'DELETE', null, token);

// ============================================================
// Templates CRUD
// ============================================================
export const getTemplates = () => request('/static/templates', 'GET');
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



// Get user's notifications
export const getNotifications = async (token, limit = 50, offset = 0) => {
    return request(`/notifications?limit=${limit}&offset=${offset}`, 'GET', null, token);
};

// Get unread notification count
export const getUnreadCount = async (token) => {
    return request('/notifications/unread-count', 'GET', null, token);
};

// Mark a single notification as read
export const markNotificationRead = async (id, token) => {
    return request(`/notifications/${id}/read`, 'PUT', null, token);
};

// Mark all notifications as read
export const markAllNotificationsRead = async (token) => {
    return request('/notifications/mark-all-read', 'PUT', null, token);
};