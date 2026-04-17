/**
 * ARCHITECTURE GUARD: LAYER 3 - DEEP DIAGNOSTICS
 * ----------------------------------------------
 * Scope: Root Cause Analysis & Granular Segmentation.
 * Rules:
 * 1. Purely for deep-dive diagnostics (Demographics, Bounce Rate, Competitor Share).
 * 2. Must remain HIDDEN from the main UI flow (Drawer/Modal only).
 * 3. Only accessed via explicit "Advanced Insights" trigger from Layer 2.
 */
import React from 'react';
import { X, Users, Globe, Timer, Target, BarChart2, PieChart } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

const DrilldownSection = ({ title, icon: Icon, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <div className="p-1.5 bg-indigo-50 rounded text-indigo-600">
                <Icon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-gray-800">{title}</h4>
        </div>
        {children}
    </div>
);

const AdvancedDrilldown = ({ details, onClose }) => {
    if (!details) return null;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        Advanced Insights
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Deep dive analytics & segmentation</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* 1. Audience Demographics */}
                <DrilldownSection title="Audience Demographics" icon={Users}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age Dist */}
                        <div className="h-48">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Age Distribution</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={details.demographics?.age || []}>
                                    <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gender Split */}
                        <div className="h-48">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Gender Split</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie
                                        data={details.demographics?.gender || []}
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(details.demographics?.gender || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </DrilldownSection>

                {/* 2. Landing Page Performance */}
                <DrilldownSection title="Landing Page Health" icon={Globe}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 mb-1">Bounce Rate</p>
                            <p className="text-xl font-bold text-gray-900">{details.landingPage?.bounceRate || 'N/A'}</p>
                            {/* Static mock improvement or hidden if no data */}
                            {details.landingPage && <p className="text-xs text-green-600 font-medium">-2.1% improvement</p>}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 mb-1">Avg. Time</p>
                            <p className="text-xl font-bold text-gray-900">{details.landingPage?.avgTime || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 mb-1">Load Time</p>
                            <p className={`text-xl font-bold ${details.landingPage?.loadTime && parseFloat(details.landingPage.loadTime) > 2 ? 'text-amber-600' : 'text-green-600'}`}>
                                {details.landingPage?.loadTime || 'N/A'}
                            </p>
                        </div>
                    </div>
                </DrilldownSection>

                {/* 3. Competitive Landscape */}
                <DrilldownSection title="Competitive Landscape" icon={Target}>
                    <div className="bg-white p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Impression Share</p>
                                <p className="text-xs text-gray-500">vs. Top 3 Competitors</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{Math.round(details.competitive?.myImpShare || 0)}%</p>
                                <p className="text-xs text-blue-600 font-medium">Your Share</p>
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="flex h-6 rounded-full overflow-hidden mb-4 bg-gray-100">
                            {/* Fallback if no competitive data: just show gray or empty */}
                            {details.competitive?.myImpShare > 0 && (
                                <div style={{ width: `${details.competitive.myImpShare}%` }} className="bg-blue-600 h-full" title="You" />
                            )}
                            {(details.competitive?.competitors || []).map((comp, i) => (
                                <div key={i} style={{ width: `${comp.value}%`, backgroundColor: comp.color }} className="h-full" title={comp.name} />
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="font-bold">You</span>
                            </div>
                            {(details.competitive?.competitors || []).map((comp, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
                                    <span>{comp.name}</span>
                                </div>
                            ))}
                            {(!details.competitive || !details.competitive.competitors) && <span className="text-gray-400 italic">No competitor data</span>}
                        </div>

                        {/* Loss Reasons */}
                        {details.competitive && (
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-500">Lost to Rank:</span>
                                    <span className="ml-2 font-bold text-gray-900">{details.competitive?.lostToRank || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Lost to Budget:</span>
                                    <span className="ml-2 font-bold text-gray-900">{details.competitive?.lostToBudget || '-'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </DrilldownSection>

            </div>
        </div>
    );
};

export default AdvancedDrilldown;
