import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FolderKanban, Building2, Calendar, Target, Activity, 
  BarChart3, Settings, AlertTriangle, Eye, CheckCircle2, PauseCircle, PlaySquare, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import { BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric } from './components/DetailLayout';

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const AdminProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/projects');
      const found = (data.projects || []).find(p => p.id === id);
      if (found) {
        setProject(found);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      // Stub for api call
      setProject({ ...project, status: newStatus });
    } catch (err) {
      alert(err.message || 'Error changing status');
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center py-32">
              <span className="text-gray-500">Loading project...</span>
          </div>
      );
  }

  if (error || !project) {
      return (
          <div className="flex flex-col items-center justify-center py-32 text-red-500">
              <AlertTriangle size={36} className="mb-4" />
              <p className="font-semibold">{error}</p>
          </div>
      );
  }

  const projectStatus = project.status || 'active';
  const sStyle = statusStyles[projectStatus] || statusStyles.active;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <BaseDetailLayout backUrl="/admin/projects" backLabel="Back to Projects">
      
      <DetailHeader 
        title={project.name}
        subtitle={project.organization_name || 'No Organization'}
        icon={Building2}
        badge={
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${sStyle}`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
              {projectStatus}
          </span>
        }
      />

      <DetailGrid>
        {/* 🟩 LEFT SECTION (8 Cols) */}
        <LeftColumn>
          
          {/* Section 1: Overview */}
          <DetailCard title="Project Overview" icon={FolderKanban}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <DetailMetric label="Project Name" value={project.name} />
                  <DetailMetric label="Organization" value={project.organization_name || '—'} />
                  <DetailMetric label="Created Date" value={formatDate(project.created_at)} />
                  <DetailMetric 
                      label="Owner Email" 
                      value={project.user_email || '—'} 
                  />
              </div>
          </DetailCard>

          {/* Section 2: Pipeline Metrics */}
          <DetailCard title="Pipeline Metrics" icon={BarChart3}>
            <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
              <div className="pl-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 flex items-end gap-2">
                  0 <span className="text-xs text-gray-400 font-normal mb-1">active</span>
                </p>
              </div>
              <div className="px-6 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="px-6 text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conversion</p>
                <p className="text-2xl font-bold text-emerald-600">0%</p>
              </div>
            </div>
          </DetailCard>

          {/* Section 3: Activity Timeline */}
          <DetailCard title="Recent Activity" icon={Activity}>
             <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                   <CheckCircle2 size={14} className="text-blue-600" />
                 </div>
                 <div className="w-px h-12 bg-gray-100 my-1"></div>
               </div>
               <div className="pt-1 w-full">
                 <p className="text-sm font-semibold text-gray-900">Project Initialized</p>
                 <p className="text-xs text-gray-500 my-0.5">Project container created inside workspace.</p>
                 <p className="text-[11px] text-gray-400 font-medium font-mono mt-1">{formatDate(project.created_at)}</p>
               </div>
             </div>
          </DetailCard>

        </LeftColumn>

        {/* 🟨 RIGHT SECTION (4 Cols) */}
        <RightColumn>
          
          {/* 1. Status Card */}
          <DetailCard title="Current Status" icon={Target}>
             <div className="flex flex-col gap-4">
                 <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 border ${sStyle}`}>
                     <div className={`w-2 h-2 rounded-full bg-current`} />
                     {projectStatus}
                 </div>
                 <div className="flex flex-col gap-2 mt-2">
                   {projectStatus === 'active' ? (
                     <button 
                       onClick={() => handleUpdateStatus('paused')}
                       className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                     >
                       <PauseCircle size={16} /> Pause Project
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleUpdateStatus('active')}
                       className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                     >
                       <PlaySquare size={16} /> Activate Project
                     </button>
                   )}
                 </div>
             </div>
          </DetailCard>

          {/* 2. Organization Info */}
          <DetailCard title="Workspace Entity" icon={Building2}>
             <p className="text-sm font-medium text-gray-900 mb-2">{project.organization_name || 'No Org Details'}</p>
             <button 
               onClick={() => alert(`View ${project.organization_name} Details`)}
               className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
             >
               View Organization Profile <ChevronRight size={14} className="mt-px ml-1" />
             </button>
          </DetailCard>

          {/* 3. Actions Panel (Sticky) */}
          <div className="sticky top-6">
             <DetailCard title="Project Actions" icon={Settings}>
               <div className="flex flex-col gap-3">
                 <button className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-2">
                   <Settings size={16} /> Edit Settings
                 </button>
                 
                 <button className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
                   <Eye size={16} /> View Campaigns
                 </button>
                 
                 <div className="w-full h-px bg-gray-100 my-2"></div>
                 
                 <button 
                   onClick={() => alert('Delete triggered')}
                   className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 flex items-center justify-center gap-2 border border-red-100"
                 >
                   <AlertTriangle size={16} /> Delete Project
                 </button>
               </div>
             </DetailCard>
          </div>

        </RightColumn>
      </DetailGrid>
    </BaseDetailLayout>
  );
};

export default AdminProjectDetail;
