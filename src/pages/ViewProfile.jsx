// src/pages/ViewProfile.jsx

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

const ViewProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userData = await getCurrentUser(token);
            setProfile(userData);
            setError(null);
        } catch (err) {
            console.error('Error loading profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="animate-pulse">
                            <div className="bg-gray-200 h-40"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            Error: {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                <span className="text-3xl font-bold text-blue-600">
                                    {getInitials(profile?.name)}
                                </span>
                            </div>
                            
                            {/* Name */}
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {profile?.name}
                            </h1>
                            
                            {/* Role Badge */}
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                                profile?.role === 'admin' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-blue-500 text-white'
                            }`}>
                                {profile?.role === 'admin' ? 'Administrator' : 'User'}
                            </span>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-6">
                        {/* Personal Information */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                                Personal Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Full Name</div>
                                    <div className="flex-1 text-gray-800">{profile?.name || 'N/A'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Email Address</div>
                                    <div className="flex-1 text-gray-800 break-all">{profile?.email || 'N/A'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Employee ID</div>
                                    <div className="flex-1 text-gray-800">{profile?.employee_id || 'Not assigned'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Role</div>
                                    <div className="flex-1 text-gray-800 capitalize">{profile?.role || 'User'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Organization Information */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                                Organization Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Department</div>
                                    <div className="flex-1 text-gray-800">{profile?.department || 'Not specified'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Branch</div>
                                    <div className="flex-1 text-gray-800">{profile?.branch || 'Not specified'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-full sm:w-32 text-sm text-gray-500 font-medium">Member Since</div>
                                    <div className="flex-1 text-gray-800">{formatDate(profile?.created_at)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-green-700 font-medium">Account Status: Active</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Last Login: Today
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            For any updates to your profile, please contact your system administrator
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfile;