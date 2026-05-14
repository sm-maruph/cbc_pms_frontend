import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, RefreshCw, UserPlus, CheckCircle } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { Link } from 'react-router-dom';

export default function NotificationsPage({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('cbcToken');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications(token, 100, 0);
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id, token);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
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
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_ticket': return <AlertCircle className="text-green-500" size={20} />;
            case 'status_change': return <RefreshCw className="text-blue-500" size={20} />;
            case 'assignment': return <UserPlus className="text-purple-500" size={20} />;
            default: return <Bell className="text-gray-500" size={20} />;
        }
    };

    // Simple relative time formatter
    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';

        // Parse the UTC string - JavaScript automatically converts to local time
        const date = new Date(dateString);
        const now = new Date();

        // Calculate difference in milliseconds
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Debug logs - remove after testing
        console.log("Notification UTC:", dateString);
        console.log("Converted to local:", date.toString());
        console.log("Current local:", now.toString());
        console.log("Minutes difference:", diffMins);

        // Show relative time
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        // For older notifications, show actual date
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bell size={24} className="text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <CheckCheck size={16} />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-gray-50 transition ${!notif.is_read ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <p className="font-semibold text-gray-800">{notif.title}</p>
                                            <span className="text-xs text-gray-400">
                                                {formatRelativeTime(notif.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">{notif.message}</p>
                                        {notif.ticket_sl && (
                                            <Link
                                                to={`/ticket/${notif.ticket_sl}`}
                                                className="text-xs text-blue-500 hover:text-blue-600 mt-2 inline-block"
                                            >
                                                View Ticket #{notif.ticket_sl} →
                                            </Link>
                                        )}
                                    </div>
                                    {!notif.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}