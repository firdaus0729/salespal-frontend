import React, { useState } from 'react';
import { Mail, UserPlus, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';

const WorkspaceTab = () => {
    const { showToast } = useToast();
    const [workspaceData, setWorkspaceData] = useState({
        companyName: 'SalesPal Inc.',
        workspaceName: 'Marketing Team'
    });
    const [inviteEmail, setInviteEmail] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: 'Demo User', email: 'demo@salespal.ai', role: 'Admin', avatar: null },
        { id: 2, name: 'John Smith', email: 'john@salespal.ai', role: 'Member', avatar: null },
        { id: 3, name: 'Sarah Johnson', email: 'sarah@salespal.ai', role: 'Member', avatar: null }
    ]);

    const getInitials = (name) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleInputChange = (field, value) => {
        setWorkspaceData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsDirty(false);
        showToast({ title: 'Success', description: 'Workspace updated successfully', variant: 'success' });
    };

    const handleInvite = () => {
        if (!inviteEmail) return;

        showToast({ title: 'Invitation Sent', description: `Invitation sent to ${inviteEmail}`, variant: 'success' });
        setInviteEmail('');
    };

    const handleRemoveMember = (memberId) => {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        showToast({ title: 'Member Removed', description: 'Team member removed', variant: 'success' });
    };

    return (
        <div className="space-y-6">
            {/* Organization Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Organization</h2>

                <div className="space-y-4 max-w-md">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={workspaceData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Workspace Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            value={workspaceData.workspaceName}
                            onChange={(e) => handleInputChange('workspaceName', e.target.value)}
                            placeholder="Optional"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Team Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Role
                        </label>
                        <Badge variant="primary" className="text-sm px-3 py-1">Admin</Badge>
                    </div>

                    {/* Save Button */}
                    {isDirty && (
                        <Button onClick={handleSave} isLoading={isSaving} className="mt-2">
                            Save Changes
                        </Button>
                    )}
                </div>
            </Card>

            {/* Invite Team Members Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Invite Team Members</h2>

                <div className="flex gap-3 max-w-md">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <Button onClick={handleInvite} disabled={!inviteEmail}>
                        <UserPlus size={16} className="mr-2" />
                        Invite
                    </Button>
                </div>
            </Card>

            {/* Team Members List Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Members</h2>

                {teamMembers.length > 0 ? (
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(member.name)}
                                    </div>

                                    {/* Member Info */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{member.name}</h3>
                                            <Badge
                                                variant={member.role === 'Admin' ? 'primary' : 'default'}
                                                className="text-xs"
                                            >
                                                {member.role}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Mail size={12} />
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Remove Button (only for non-admin members) */}
                                {member.role !== 'Admin' && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No team members yet</p>
                        <p className="text-sm text-gray-400 mt-1">Invite your first team member to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default WorkspaceTab;
