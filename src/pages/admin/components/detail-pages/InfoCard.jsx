import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

/**
 * InfoCard - Display info fields with optional edit mode
 * Usage: <InfoCard title="Contact Information" fields={[{label, value, key}]} />
 */
const InfoCard = ({ 
  title, 
  fields = [], 
  icon: Icon,
  editable = false,
  editing = false,
  onSave = () => {},
  onCancel = () => {},
  formData = {},
  setFormData = () => {}
}) => {

  const handleToggleEdit = () => {
    if (editing) {
      onSave();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-blue-600" />}
          {title}
        </h2>
        {editable && (
          <button
            onClick={handleToggleEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={editing ? "Save" : "Edit"}
          >
            {editing ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Edit2 size={18} className="text-gray-600" />
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key || field.label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {field.label}
            </label>
            {editing && field.editable !== false ? (
              <input
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{field.value || '-'}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
