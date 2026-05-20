// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://stilt-ardently-recoup.ngrok-free.dev/api';  //http://localhost:5000

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

// Auth
export const login = (email, password) => request('/auth/login', 'POST', { email, password });

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

// ============================================================
// Notifications
// ============================================================
export const getNotifications = async (token, limit = 50, offset = 0) => {
    return request(`/notifications?limit=${limit}&offset=${offset}`, 'GET', null, token);
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





// // src/services/api.js
// const API_BASE = import.meta.env.VITE_API_URL || 'https://stilt-ardently-recoup.ngrok-free.dev/api';  //http://localhost:5000

// const request = async (endpoint, method = 'GET', body = null, token = null) => {
//     console.log(`Request: ${method} ${endpoint}, token: ${token ? 'present' : 'missing'}`);
//     const headers = { 'Content-Type': 'application/json' };
//     if (token) headers['Authorization'] = `Bearer ${token}`;
//     const options = { method, headers };
//     if (body) options.body = JSON.stringify(body);

//     try {
//         const response = await fetch(`${API_BASE}${endpoint}`, options);
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message || 'Request failed');
//         return data;
//     } catch (error) {
//         console.error(`API Error: ${error.message}`);
//         throw error;
//     }
// };

// // Auth
// export const login = (email, password) => request('/auth/login', 'POST', { email, password });

// // Tickets
// export const getTickets = (token) => request('/tickets', 'GET', null, token);
// export const getMyTickets = (token) => request('/tickets/my', 'GET', null, token);
// export const createTicket = (ticketData, token) => request('/tickets', 'POST', ticketData, token);
// export const updateTicket = (id, updates, token) => request(`/tickets/${id}`, 'PUT', updates, token);
// export const deleteTicket = (id, token) => request(`/tickets/${id}`, 'DELETE', null, token);

// // ✅ NEW: Get ticket by ticket_sl (for displaying ticket details)
// export const getTicketBySL = (ticket_sl, token) => request(`/tickets/sl/${ticket_sl}`, 'GET', null, token);

// // Dashboard stats
// // Dashboard stats - Updated to match backend route
// export const getDashboardStats = async (token, dateFilter = 'all') => {
//     const response = await fetch(`${API_BASE}/tickets/stats?dateFilter=${dateFilter}`, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     });
//     if (!response.ok) throw new Error('Failed to fetch dashboard stats');
//     return response.json();
// };

// export const getPaginatedTickets = async (token, params = {}) => {
//     const queryParams = new URLSearchParams(params).toString();
//     const response = await fetch(`${API_BASE}/tickets/paginated?${queryParams}`, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     });
//     if (!response.ok) throw new Error('Failed to fetch paginated tickets');
//     return response.json();
// };

// // Reports
// export const getReportData = (range, startDate, endDate, token) => {
//     let url = `/reports?range=${range}`;
//     if (range === 'custom' && startDate && endDate) {
//         url += `&startDate=${startDate}&endDate=${endDate}`;
//     }
//     return request(url, 'GET', null, token);
// };

// // Users - Regular users (for assignment dropdown)
// export const getAssignableUsers = (token) => request('/users/assignable', 'GET', null, token);

// // Admin users (full user management)
// export const getUsers = (token) => request('/users', 'GET', null, token);
// export const createUser = (userData, token) => request('/users', 'POST', userData, token);
// export const updateUser = (id, userData, token) => request(`/users/${id}`, 'PUT', userData, token);
// export const deleteUser = (id, token) => request(`/users/${id}`, 'DELETE', null, token);

// // ✅ NEW: Get current user profile
// export const getCurrentUser = (token) => request('/auth/me', 'GET', null, token);

// // ✅ NEW: Update user profile (for regular users)
// export const updateUserProfile = (userData, token) => request('/auth/profile', 'PUT', userData, token);

// // ============================================================
// // Systems CRUD
// // ============================================================
// export const getSystems = () => request('/static/systems', 'GET');
// export const createSystem = (name, token) => request('/static/systems', 'POST', { name }, token);
// export const updateSystem = (id, data, token) => request(`/static/systems/${id}`, 'PUT', data, token);
// export const deleteSystem = (id, token) => request(`/static/systems/${id}`, 'DELETE', null, token);

// // ============================================================
// // Departments CRUD
// // ============================================================
// export const getDepartments = () => request('/static/departments', 'GET');
// export const createDepartment = (name, token) => request('/static/departments', 'POST', { name }, token);
// export const updateDepartment = (id, data, token) => request(`/static/departments/${id}`, 'PUT', data, token);
// export const deleteDepartment = (id, token) => request(`/static/departments/${id}`, 'DELETE', null, token);

// // ============================================================
// // Branches CRUD
// // ============================================================
// export const getBranches = () => request('/static/branches', 'GET');
// export const createBranch = (name, token) => request('/static/branches', 'POST', { name }, token);
// export const updateBranch = (id, data, token) => request(`/static/branches/${id}`, 'PUT', data, token);
// export const deleteBranch = (id, token) => request(`/static/branches/${id}`, 'DELETE', null, token);

// // ============================================================
// // Templates CRUD
// // ============================================================
// export const getTemplates = () => request('/static/templates', 'GET');
// export const createTemplate = (templateData, token) => request('/static/templates', 'POST', templateData, token);
// export const updateTemplate = (id, templateData, token) => request(`/static/templates/${id}`, 'PUT', templateData, token);
// export const deleteTemplate = (id, token) => request(`/static/templates/${id}`, 'DELETE', null, token);

// // ============================================================
// // User Favorites
// // ============================================================
// export const getUserFavorites = (token) => request('/static/favorites', 'GET', null, token);
// export const toggleFavorite = (templateId, token) => request(`/static/favorites/${templateId}`, 'POST', null, token);

// // ============================================================
// // Dashboard Statistics
// // ============================================================
// export const getTicketStats = (token) => request('/stats/tickets', 'GET', null, token);
// export const getRiskStats = (token) => request('/stats/risk', 'GET', null, token);



// // Get user's notifications
// export const getNotifications = async (token, limit = 50, offset = 0) => {
//     return request(`/notifications?limit=${limit}&offset=${offset}`, 'GET', null, token);
// };

// // Get unread notification count
// export const getUnreadCount = async (token) => {
//     return request('/notifications/unread-count', 'GET', null, token);
// };

// // Mark a single notification as read
// export const markNotificationRead = async (id, token) => {
//     return request(`/notifications/${id}/read`, 'PUT', null, token);
// };

// // Mark all notifications as read
// export const markAllNotificationsRead = async (token) => {
//     return request('/notifications/mark-all-read', 'PUT', null, token);
// };


// // services/api.js - Replace the bulk import functions with these

// // Bulk import validation
// export const validateBulkTickets = async (ticketsData, token) => {
//     return request('/tickets/bulk-import/validate', 'POST', ticketsData, token);
// };

// // Bulk import tickets
// export const bulkImportTickets = async (ticketsData, token) => {
//     return request('/tickets/bulk-import', 'POST', ticketsData, token);
// };