import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/api';

const NotificationBell = ({ user }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem('cbcToken');

    console.log("🔔 NotificationBell rendering for user:", user?.email);

    // Load notifications from API
    const loadNotifications = async () => {
        if (!token) {
            console.log("No token, skipping fetch");
            setLoading(false);
            return;
        }
        try {
            const [notifsData, countData] = await Promise.all([
                getNotifications(token, 10, 0),  // Get last 10 notifications
                getUnreadCount(token)
            ]);
            setNotifications(notifsData || []);
            setUnreadCount(countData.count || 0);
            console.log(`Loaded ${notifsData?.length || 0} notifications, ${countData.count || 0} unread`);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load notifications on mount and periodically
    useEffect(() => {
        loadNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id, token);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(token);
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: 1 }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_ticket': return <AlertCircle className="text-green-500" size={16} />;
            case 'status_change': return <RefreshCw className="text-blue-500" size={16} />;
            case 'assignment': return <UserPlus className="text-purple-500" size={16} />;
            default: return <Bell className="text-gray-500" size={16} />;
        }
    };

   
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();

        // Convert to local time (Bangladesh GMT+6)
        const localDate = new Date(date.getTime() + (6 * 60 * 60 * 1000));
        const localNow = new Date(now.getTime() + (6 * 60 * 60 * 1000));

        const diffMs = localNow - localDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        // For older notifications, show full local date/time
        return localDate.toLocaleString('en-BD', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka'
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {!loading && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm mt-2">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5 break-words">{notif.message}</p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(notif.created_at)}
                                                </p>
                                                {notif.ticket_sl && (
                                                    <span className="text-xs text-blue-500">
                                                        Ticket #{notif.ticket_sl}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-200 bg-gray-50">
                            <Link
                                to="/notifications"
                                className="block text-center text-xs text-blue-600 hover:text-blue-700 py-1"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;