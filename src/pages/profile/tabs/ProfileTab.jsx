import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../lib/api';

const ProfileTab = () => {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        fullName: user?.full_name || user?.name || '',
        email: user?.email || '',
        role: user?.metadata?.jobTitle || '',
        phone: user?.metadata?.phone?.replace(/^\+91\s?/, '') || '',
    });
    const [avatar, setAvatar] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Re-sync form when user object updates (e.g. after save + refreshUser)
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.full_name || user.name || '',
                email: user.email || '',
                role: user.metadata?.jobTitle || '',
                phone: user.metadata?.phone?.replace(/^\+91\s?/, '') || '',
            });
        }
    }, [user]);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    // Compress uploaded image to ~128×128 before storing as base64
    const compressImage = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const SIZE = 128;
                const canvas = document.createElement('canvas');
                canvas.width = SIZE;
                canvas.height = SIZE;
                const ctx = canvas.getContext('2d');
                // Crop centre square
                const min = Math.min(img.width, img.height);
                const sx = (img.width - min) / 2;
                const sy = (img.height - min) / 2;
                ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setAvatar(compressed);
                setIsDirty(true);
            } catch {
                showToast({ title: 'Error', description: 'Could not process image', variant: 'error' });
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/users/me', {
                fullName: formData.fullName,
                ...(avatar ? { avatarUrl: avatar } : {}),
                metadata: {
                    ...(user?.metadata || {}),
                    jobTitle: formData.role,
                    phone: formData.phone ? `+91 ${formData.phone.replace(/\D/g, '').slice(0, 10)}` : '',
                },
            });
            await refreshUser();
            setAvatar(null); // clear local state — sidebar now reads from user.avatar_url in context
            setIsDirty(false);
            showToast({ title: 'Success', description: 'Profile updated successfully', variant: 'success' });
        } catch (err) {
            showToast({ title: 'Error', description: err?.message || 'Failed to save profile', variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {/* Avatar */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {avatar || user?.avatar_url ? (
                                <img
                                    src={avatar || user?.avatar_url}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold border-4 border-gray-100">
                                    {getInitials(formData.fullName)}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="mb-2">
                                <Upload size={16} className="mr-2" />
                                Upload Photo
                            </Button>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role / Job Title</label>
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            placeholder="e.g., Product Manager"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-300 shrink-0 select-none">
                                <span className="text-lg leading-none">🇮🇳</span>
                                <span className="text-sm font-semibold text-gray-600">+91</span>
                            </div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="98765 43210"
                                maxLength={10}
                                className="flex-1 px-3 py-2.5 outline-none bg-white text-sm"
                            />
                        </div>
                    </div>
                </div>

                {isDirty && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button onClick={handleSave} isLoading={isSaving} className="px-6">
                            Save Changes
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProfileTab;
