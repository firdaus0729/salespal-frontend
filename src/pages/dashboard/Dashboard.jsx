import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketing } from '../../context/MarketingContext';
import { usePreferences } from '../../context/PreferencesContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { FolderOpen, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { projects, selectedProjectId, campaigns } = useMarketing();
    const { formatCurrency, isApproximateConversion } = usePreferences();

    // Get the active project
    const activeProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [projects, selectedProjectId]);

    // Calculate campaign metrics for the active project
    const projectMetrics = useMemo(() => {
        if (!activeProject) return { runningCampaigns: 0, totalDailySpend: 0 };

        const projectCampaigns = campaigns.filter(c => c.projectId === activeProject.id);
        const runningCampaigns = projectCampaigns.filter(c =>
            c.status === 'running' || c.status === 'active'
        );

        // Aggregate daily spend from all running campaigns
        const totalDailySpend = runningCampaigns.reduce((sum, campaign) => {
            // Extract numeric value from dailyBudget (e.g., "₹5,000" -> 5000)
            const budgetStr = campaign.dailyBudget || campaign.budget?.daily || '₹0';
            const numericValue = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
            return sum + numericValue;
        }, 0);

        return {
            runningCampaigns: runningCampaigns.length,
            totalDailySpend
        };
    }, [activeProject, campaigns]);

    // Empty state when no project is selected
    if (!activeProject) {
        return (
            <div className="max-w-5xl">
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <FolderOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Active Project</h2>
                    <p className="text-gray-400 text-center mb-6 max-w-md">
                        Select an existing project or create a new one to get started with your marketing campaigns.
                    </p>
                    <Button onClick={() => navigate('/marketing/projects')}>
                        Select or Create Project
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            {/* Project Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{activeProject.name}</h1>
                        <p className="text-gray-400">Your AI-powered marketing dashboard</p>
                    </div>
                    <Badge variant="success" className="capitalize">
                        Active
                    </Badge>
                </div>
            </div>

            {/* Project Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Industry */}
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Industry</h3>
                    <p className="text-xl font-semibold text-white capitalize">
                        {activeProject.industry || 'Not specified'}
                    </p>
                </Card>

                {/* Status */}
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xl font-semibold text-green-400">Active</span>
                    </div>
                </Card>

                {/* Running Campaigns */}
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Running Campaigns</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-semibold text-white">
                            {projectMetrics.runningCampaigns}
                        </p>
                        <span className="text-sm text-gray-500">active</span>
                    </div>
                </Card>

                {/* Total Daily Spend */}
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Total Daily Spend</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-semibold text-white">
                            {formatCurrency(projectMetrics.totalDailySpend)}
                        </p>
                        <span className="text-sm text-gray-500">/day</span>
                        {isApproximateConversion && <span className="text-[10px] text-amber-400">approx.</span>}
                    </div>
                </Card>
            </div>

            {/* Active Modules Section */}
            {activeProject.modules && activeProject.modules.length > 0 && (
                <Card className="p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Modules</h3>
                    <div className="flex flex-wrap gap-2">
                        {activeProject.modules.map(mod => (
                            <Badge key={mod} variant="secondary" className="capitalize">
                                {mod}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate(`/marketing/projects/${activeProject.id}/campaigns/new`)}
                        className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Create Campaign</p>
                            <p className="text-sm text-gray-400">Launch a new marketing campaign</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/marketing/analytics')}
                        className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">View Analytics</p>
                            <p className="text-sm text-gray-400">Track campaign performance</p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
