import React, { useState } from 'react';
import { Eye, EyeOff, Monitor, Smartphone, Globe, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

const SecurityTab = () => {
    const { showToast } = useToast();
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Mock active sessions data
    const [sessions, setSessions] = useState([
        {
            id: 1,
            device: 'MacBook Pro',
            browser: 'Chrome 120',
            location: 'San Francisco, CA',
            lastActive: '2 minutes ago',
            current: true
        },
        {
            id: 2,
            device: 'iPhone 15 Pro',
            browser: 'Safari',
            location: 'San Francisco, CA',
            lastActive: '1 hour ago',
            current: false
        }
    ]);

    // Mock audit log data
    const auditLogs = [
        { id: 1, action: 'Logged in', timestamp: '2 minutes ago' },
        { id: 2, action: 'Plan purchased', timestamp: '2 days ago' },
        { id: 3, action: 'Project created', timestamp: '3 days ago' },
        { id: 4, action: 'Password changed', timestamp: '1 week ago' }
    ];

    const validatePassword = () => {
        const newErrors = {};

        if (!passwordData.current) {
            newErrors.current = 'Current password is required';
        }

        if (!passwordData.new) {
            newErrors.new = 'New password is required';
        } else if (passwordData.new.length < 8) {
            newErrors.new = 'Password must be at least 8 characters';
        }

        if (passwordData.new !== passwordData.confirm) {
            newErrors.confirm = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = async () => {
        if (!validatePassword()) return;

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setPasswordData({ current: '', new: '', confirm: '' });
        showToast({ title: 'Success', description: 'Password updated successfully', variant: 'success' });
    };

    const handleRevokeSession = (sessionId) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
        showToast({ title: 'Session Revoked', description: 'The session has been successfully revoked', variant: 'success' });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="space-y-6">
            {/* Change Password Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

                <div className="space-y-4 max-w-md">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.current ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.current && <p className="text-sm text-red-600 mt-1">{errors.current}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.new ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.new && <p className="text-sm text-red-600 mt-1">{errors.new}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirm ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>}
                    </div>

                    <Button onClick={handlePasswordChange} isLoading={isSaving} className="mt-2">
                        Update Password
                    </Button>
                </div>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">2FA setup coming soon</p>
                    </div>
                )}
            </Card>

            {/* Active Sessions Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Sessions</h2>

                {sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                        {session.device.includes('MacBook') || session.device.includes('Laptop') ? (
                                            <Monitor size={20} className="text-gray-600" />
                                        ) : (
                                            <Smartphone size={20} className="text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{session.device}</h3>
                                            {session.current && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{session.browser}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Globe size={12} />
                                                {session.location}
                                            </span>
                                            <span>Last active: {session.lastActive}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Monitor size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No active sessions found</p>
                    </div>
                )}
            </Card>

            {/* Audit Log Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

                {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700">{log.action}</span>
                                <span className="text-sm text-gray-400">{log.timestamp}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SecurityTab;
