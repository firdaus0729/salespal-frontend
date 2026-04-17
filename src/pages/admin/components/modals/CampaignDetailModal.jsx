import React, { useState } from 'react';

const CampaignDetailModal = ({ data, open, onClose, onSave }) => {
  if (!open) return null;
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(data || {});

  const handleSave = () => {
    onSave(formData);
    setEditing(false);
    console.log('Saved campaign:', formData);
  };

  const getStatusVariant = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">{editing ? 'Edit Campaign' : 'Campaign Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input value={formData.user || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <input value={formData.project || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
            <span className="font-semibold text-lg">{formData.leads?.toLocaleString()}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversions</label>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{formData.conversions?.toLocaleString()}</span>
              {data?.leads > 0 && <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-medium">{((formData.conversions / data.leads) * 100).toFixed(1)}%</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusVariant(formData.status)}`}>
              {formData.status}
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => setEditing(true)} 
            disabled
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailModal;


