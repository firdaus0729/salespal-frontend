import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';

const pipelineColumns = ['New', 'Contacted', 'Interested', 'Qualified', 'Won', 'Lost'];

const SalesPipeline = () => {
    const { leads, updateLeadStatus } = useSales();
    const [draggingId, setDraggingId] = useState(null);

    const handleDragStart = (e, id) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Need to set data to enable drag on Firefox
        e.dataTransfer.setData('text/plain', id);

        // Add a class for visual styling during drag if needed
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e) => {
        setDraggingId(null);
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        if (!draggingId) return;

        // If dropping in the same column, do nothing
        const lead = leads.find(l => l.id === draggingId);
        if (lead && lead.status !== status) {
            updateLeadStatus(draggingId, status);
        }
        setDraggingId(null);
    };

    return (
        <div className="font-sans text-gray-900 pb-12 h-screen flex flex-col">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-gray-100 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Sales Pipeline
                    </h1>
                    <p className="text-gray-500 mt-1">Drag and drop leads between stages to track your progress.</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 pb-6 h-full min-w-max items-start">
                    {pipelineColumns.map((status) => {
                        const columnLeads = leads.filter(l => l.status === status)
                            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

                        return (
                            <div
                                key={status}
                                className="w-80 bg-gray-100/70 rounded-xl p-4 flex flex-col max-h-full border border-gray-200 shadow-sm"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status)}
                            >
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'Won' ? 'bg-green-500' :
                                                status === 'Lost' ? 'bg-red-500' :
                                                    status === 'New' ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                            }`} />
                                        {status}
                                    </h3>
                                    <div className="text-xs font-medium bg-white text-gray-500 px-2 py-0.5 rounded-full shadow-sm">
                                        {columnLeads.length}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                                    {columnLeads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            onDragEnd={handleDragEnd}
                                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group"
                                        >
                                            <div className="font-semibold text-gray-900 mb-1 leading-tight group-hover:text-blue-700 transition-colors">
                                                {lead.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2 truncate">
                                                {lead.campaign}
                                            </div>

                                            <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-50">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <span className="font-medium mr-1 text-gray-700">Phone:</span> {lead.phone}
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="font-medium mr-1 text-gray-700">Source:</span>
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{lead.source}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {columnLeads.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400 font-medium bg-gray-50/50">
                                            Drop here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SalesPipeline;
