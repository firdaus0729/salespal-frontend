import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, FolderOpen, Globe, Settings, Loader2, Check, ExternalLink, Activity
} from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import CampaignCard from '../components/CampaignCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

import { 
    BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric 
} from '../../admin/components/DetailLayout';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { projects, projectsLoading, getCampaignsByProject, updateProject, deleteProject, updateCampaign, deleteCampaign, activeDraft } = useMarketing();

    // Project fetch state
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Modals state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', industry: '', website: '' });

    // Campaign Modals state
    const [isCampaignDeleteModalOpen, setIsCampaignDeleteModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    useEffect(() => {
        if (projectsLoading) {
            setLoading(true);
            return;
        }

        const foundProject = projects.find(p => p.id === projectId);
        if (!foundProject) {
            setNotFound(true);
        } else {
            setProject(foundProject);
            setNotFound(false);
        }

        setLoading(false);
    }, [projectId, projects, projectsLoading]);

    const campaigns = getCampaignsByProject(projectId);
    const analysis = project?.analysisData || activeDraft?.data?.analysis?.analysisData;

    const launchPoints = analysis
        ? [
            `AI-generated creatives tailored for ${analysis?.targetAudience?.description || "your audience"}`,
            `Targeting optimized for ${analysis?.industry || "your industry"}`,
            `Messaging aligned with ${analysis?.businessOverview?.brandTone || "your brand tone"}`,
        ]
        : [
            "AI-generated ad creatives tailored to your audience",
            "Automated campaign setup for high performance",
            "Real-time optimization and targeting",
        ];

    useEffect(() => {
        if (project) {
            setEditData({
                name: project.name,
                industry: project.industry,
                website: project.website || ''
            });
        }
    }, [project]);

    const handleUpdateProject = (e) => {
        e.preventDefault();
        updateProject(projectId, editData);
        setIsEditModalOpen(false);
    };

    const handleDeleteProject = () => {
        deleteProject(projectId);
        navigate('/marketing/projects');
    };

    const handleCampaignEditClick = (campaign) => {
        navigate(`/marketing/projects/${projectId}/campaigns/${campaign.id}/edit`);
    };

    const handleCampaignDeleteClick = (campaign) => {
        setSelectedCampaign(campaign);
        setIsCampaignDeleteModalOpen(true);
    };

    const handleCampaignToggleStatus = (campaign) => {
        let newStatus = 'active';
        if (campaign.status === 'active') {
            newStatus = 'paused';
        } else if (campaign.status === 'paused' || campaign.status === 'draft') {
            newStatus = 'active';
        }
        updateCampaign(campaign.id, { status: newStatus });
    };

    const handleDeleteCampaignConfirm = () => {
        if (selectedCampaign) {
            deleteCampaign(selectedCampaign.id);
            setIsCampaignDeleteModalOpen(false);
            setSelectedCampaign(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading project...</p>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Project not found</h3>
                <p className="text-gray-500 mb-6">The project you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/marketing/projects')}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <BaseDetailLayout backUrl="/marketing/projects" backLabel="Back to Projects">
            <DetailHeader 
                title={project.name}
                subtitle={`Industry: ${project.industry || 'General'}`}
                icon={FolderOpen}
                actions={
                    <Button onClick={() => navigate(`/marketing/projects/${projectId}/campaigns/new`)}>
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                }
            />

            <DetailGrid>
                {/* 🟩 LEFT SECTION (8 Cols) */}
                <LeftColumn>
                    <DetailCard title="Project Campaigns" icon={Activity} className="!bg-transparent !border-0 !shadow-none !p-0">
                        {campaigns.length > 0 ? (
                            <div className="space-y-4">
                                {campaigns.map(campaign => (
                                    <CampaignCard
                                        key={campaign.id}
                                        campaign={campaign}
                                        onEdit={handleCampaignEditClick}
                                        onDelete={handleCampaignDeleteClick}
                                        onToggleStatus={handleCampaignToggleStatus}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-100/60 flex items-center justify-center mx-auto mb-3">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">No campaigns yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto leading-snug mt-2">Launch your first campaign to start reaching your audience.</p>
                                
                                {analysis && (
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full mt-4">
                                        AI-powered insights ready
                                    </span>
                                )}
                                
                                <div className="max-w-[440px] mx-auto mt-6 p-5 rounded-xl bg-blue-50/40 border border-blue-100 text-left">
                                    <span className="text-xs uppercase tracking-wide text-blue-600 mb-3 block font-bold">Ready to Launch</span>
                                    <div className="space-y-2">
                                        {launchPoints.slice(0, 3).map((point, index) => (
                                            <div key={index} className="flex items-center gap-2.5">
                                                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                <span className="text-[13px] text-gray-700 leading-snug">{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => navigate(`/marketing/projects/${projectId}/campaigns/new`)}
                                    className="mt-6 h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white font-semibold inline-flex items-center justify-center transition-all duration-200"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create Your First Campaign
                                </button>
                            </div>
                        )}
                    </DetailCard>
                </LeftColumn>

                {/* 🟨 RIGHT SECTION (4 Cols) */}
                <RightColumn>
                    <DetailCard title="Project Details" icon={FolderOpen}>
                        <div className="flex flex-col gap-5">
                            <DetailMetric label="Project Name" value={project.name} />
                            <DetailMetric label="Industry" value={project.industry || '—'} />
                            <DetailMetric 
                                label="Target Website" 
                                value={project.website ? (
                                    <a href={`https://${project.website.replace('https://', '')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        {project.website} <ExternalLink size={12} />
                                    </a>
                                ) : '—'} 
                            />
                            <DetailMetric label="Created Date" value={formatDate(project.createdAt || new Date().toISOString())} />
                        </div>
                    </DetailCard>

                    <div className="sticky top-6">
                        <DetailCard title="Actions" icon={Settings}>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Settings size={16} /> Edit Project Settings
                                </button>
                            </div>
                        </DetailCard>
                    </div>
                </RightColumn>
            </DetailGrid>

            {/* Modals */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Settings">
                <form onSubmit={handleUpdateProject} className="space-y-4">
                    <Input
                        label="Project Name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        required
                    />
                    <Select
                        label="Industry"
                        value={editData.industry}
                        onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                        required
                    >
                        <option value="">Select industry</option>
                        <option value="SaaS">SaaS</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                    </Select>
                    <Input
                        label="Website"
                        value={editData.website}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        required
                    />
                    <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                        <Button type="button" variant="destructive" onClick={() => { setIsEditModalOpen(false); setIsDeleteModalOpen(true); }}>
                            Delete Project
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone and will delete all associated campaigns."
                confirmText="Delete Project"
            />

            <ConfirmationModal
                isOpen={isCampaignDeleteModalOpen}
                onClose={() => setIsCampaignDeleteModalOpen(false)}
                onConfirm={handleDeleteCampaignConfirm}
                title="Delete Campaign?"
                message="This action cannot be undone. This campaign will be permanently removed."
                confirmText="Delete"
                variant="danger"
            />

        </BaseDetailLayout>
    );
}
