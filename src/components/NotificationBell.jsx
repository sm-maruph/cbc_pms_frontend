import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertCircle, RefreshCw, UserPlus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

const NotificationBell = ({ user }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem('cbcToken');

    const loadNotifications = async () => {
        if (!token) { setLoading(false); return; }
        try {
            const [notifsData, countData] = await Promise.all([
                getNotifications(token, 10, 0),
                getUnreadCount(token)
            ]);
            setNotifications(notifsData || []);
            setUnreadCount(countData.count || 0);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        if (showDropdown) loadNotifications();
    }, [showDropdown]);

    useEffect(() => {
        if (!user?.email) return;
        socketService.connect(user.email);

        const handleIncoming = (notif) => {
            console.log('🔔 BELL got notification:', notif);   // 👈 add this

            setNotifications(prev => [notif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);

            try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch { }

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-gray-800 border border-gray-700 shadow-2xl rounded-xl pointer-events-auto flex overflow-hidden`}>
                    <div className="w-1 bg-indigo-500 flex-shrink-0" />
                    <div className="flex-1 p-3">
                        <p className="font-semibold text-sm text-gray-100">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                        {notif.ticket_sl && (
                            <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                                #{notif.ticket_sl}
                            </span>
                        )}
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 text-gray-500 hover:text-gray-200 transition">✕</button>
                </div>
            ), { duration: 120000, position: 'top-right' });
        };

        socketService.on('notification', handleIncoming);
        return () => socketService.off('notification', handleIncoming);
    }, [user?.email]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id, token);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(token);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // When a row is clicked: mark read (if unread). Navigation handled by Link wrapper.
    const handleRowActivate = (notif) => {
        if (!notif.is_read) handleMarkAsRead(notif.id);
        setShowDropdown(false);
    };

    const ICON_CFG = {
        new_ticket: { Icon: AlertCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        status_change: { Icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        assignment: { Icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/20' },
        default: { Icon: Bell, color: 'text-gray-400', bg: 'bg-gray-700' },
    };
    const getIconCfg = (type) => ICON_CFG[type] || ICON_CFG.default;

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    };

    // Row inner content (shared between Link and div variants)
    const RowInner = (notif) => {
        const { Icon, color, bg } = getIconCfg(notif.type);
        return (
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon size={15} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-100 truncate">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 break-words line-clamp-2">{notif.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-gray-500">{formatTime(notif.created_at)}</span>
                        {notif.ticket_sl && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-400">
                                #{notif.ticket_sl} <ChevronRight size={11} />
                            </span>
                        )}
                    </div>
                </div>
                {!notif.is_read && (
                    <span className="flex-shrink-0 mt-1 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-indigo-500/30" />
                )}
            </div>
        );
    };

    const rowCls = (notif) =>
        `block px-4 py-3 border-b border-gray-700/60 last:border-0 transition-colors cursor-pointer ${!notif.is_read ? 'bg-indigo-500/[0.07] hover:bg-indigo-500/10' : 'hover:bg-gray-700/40'
        }`;

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
        >
            <button
                onClick={() => setShowDropdown(o => !o)}
                aria-haspopup="true"
                aria-expanded={showDropdown}
                className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {!loading && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 top-full pt-2 w-96 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 overflow-hidden">

                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                    <Bell size={14} className="text-indigo-400" />
                                </div>
                                <h3 className="font-bold text-gray-100 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                                >
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-10 text-center">
                                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-600/40 border-t-indigo-500 mx-auto"></div>
                                    <p className="text-xs text-gray-500 mt-3">Loading…</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="h-12 w-12 bg-gray-700/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Bell size={22} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                    <p className="text-xs text-gray-500 mt-1">You're all caught up</p>
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

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-gray-700 bg-gray-800/80">
                                <Link
                                    to="/notifications"
                                    onClick={() => setShowDropdown(false)}
                                    className="block text-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1 transition"
                                >
                                    View all notifications →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;