import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, RefreshCw, UserPlus, ChevronRight, ChevronLeft } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

export default function NotificationsPage({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const token = localStorage.getItem('cbcToken');

    useEffect(() => { loadNotifications(1); }, []);

    const loadNotifications = async (p = 1) => {
        setLoading(true);
        try {
            const res = await getNotifications(token, PAGE_SIZE, (p - 1) * PAGE_SIZE, true);
            setNotifications(res.data || []);
            setPagination(res.pagination || null);
            setPage(p);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id, token);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(token);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const ICON_CFG = {
        new_ticket:    { Icon: AlertCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        status_change: { Icon: RefreshCw,   color: 'text-blue-400',    bg: 'bg-blue-500/20' },
        assignment:    { Icon: UserPlus,    color: 'text-violet-400',  bg: 'bg-violet-500/20' },
        default:       { Icon: Bell,        color: 'text-gray-400',    bg: 'bg-gray-700' },
    };
    const getIconCfg = (type) => ICON_CFG[type] || ICON_CFG.default;

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
        return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`;
    };

    const handleRowActivate = (notif) => {
        if (!notif.is_read) handleMarkAsRead(notif.id);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const RowInner = (notif) => {
        const { Icon, color, bg } = getIconCfg(notif.type);
        return (
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-semibold text-gray-100">{notif.title}</p>
                        <span className="text-xs text-gray-500">{formatRelativeTime(notif.created_at)}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 break-words">{notif.message}</p>
                    {notif.ticket_sl && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-indigo-400 mt-2">
                            View Ticket #{notif.ticket_sl} <ChevronRight size={13} />
                        </span>
                    )}
                </div>
                {!notif.is_read && (
                    <span className="flex-shrink-0 mt-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-indigo-500/30" />
                )}
            </div>
        );
    };

    const rowCls = (notif) =>
        `block px-6 py-4 border-b border-gray-700/60 last:border-0 transition-colors cursor-pointer ${
            !notif.is_read ? 'bg-indigo-500/[0.07] hover:bg-indigo-500/10' : 'hover:bg-gray-700/40'
        }`;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-indigo-600/40 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm font-medium">Loading notifications…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg shadow-black/20 overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Bell size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-100">Notifications</h1>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {pagination?.totalCount
                                        ? `${pagination.totalCount} total${unreadCount > 0 ? ` · ${unreadCount} unread on this page` : ''}`
                                        : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                </p>
                            </div>
                        </div>
                        {notifications.length > 0 && unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-950/40 transition"
                            >
                                <CheckCheck size={16} />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div>
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="h-14 w-14 bg-gray-700/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Bell size={26} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 font-medium">No notifications yet</p>
                                <p className="text-gray-500 text-xs mt-1">You're all caught up</p>
                            </div>
                        ) : (
                            notifications.map((notif) =>
                                notif.ticket_sl ? (
                                    <Link
                                        key={notif.id}
                                        to={`/dashboard?tab=tickets&ticket=${encodeURIComponent(notif.ticket_sl)}`}
                                        onClick={() => handleRowActivate(notif)}
                                        className={rowCls(notif)}
                                    >
                                        {RowInner(notif)}
                                    </Link>
                                ) : (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleRowActivate(notif)}
                                        className={rowCls(notif)}
                                    >
                                        {RowInner(notif)}
                                    </div>
                                )
                            )
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/60 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                <span className="text-gray-600"> · {pagination.totalCount} total</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => loadNotifications(page - 1)}
                                    disabled={!pagination.hasPrev}
                                    className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <span className="text-xs font-semibold text-gray-300 px-1">
                                    {pagination.currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => loadNotifications(page + 1)}
                                    disabled={!pagination.hasNext}
                                    className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}