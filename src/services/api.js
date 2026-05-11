// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, method = 'GET', body = null, token = null) => {
    console.log(`Request: ${method} ${endpoint}, token: ${token ? 'present' : 'missing'}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
};

// Auth
export const login = (email, password) => request('/auth/login', 'POST', { email, password });

// Tickets
export const getTickets = (token) => request('/tickets', 'GET', null, token);
export const getMyTickets = (token) => request('/tickets/my', 'GET', null, token);
export const createTicket = (ticketData, token) => request('/tickets', 'POST', ticketData, token);
export const updateTicket = (id, updates, token) => request(`/tickets/${id}`, 'PUT', updates, token);
export const deleteTicket = (id, token) => request(`/tickets/${id}`, 'DELETE', null, token);

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

// Admin users
export const getUsers = (token) => request('/users', 'GET', null, token);
export const createUser = (userData, token) => request('/users', 'POST', userData, token);
export const updateUser = (id, userData, token) => request(`/users/${id}`, 'PUT', userData, token);
export const deleteUser = (id, token) => request(`/users/${id}`, 'DELETE', null, token);