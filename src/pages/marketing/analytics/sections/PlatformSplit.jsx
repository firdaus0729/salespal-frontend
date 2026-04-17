import React, { useState, useMemo } from 'react';
import AnalyticsSection from '../AnalyticsSection';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';

const RADIAN = Math.PI / 180;

// Custom active segment renderer
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
        <g>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#374151" className="text-xs font-medium">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#111827" className="text-lg font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 12}
                fill={fill}
            />
        </g>
    );
};

const PlatformSplit = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [metric, setMetric] = useState('spend'); // spend or leads

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const isEmpty = !data?.length;

    // Find top channel
    const topChannel = useMemo(() => {
        if (!data?.length) return null;
        return data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
    }, [data]);

    return (
        <AnalyticsSection
            title="Platform Split"
            subtitle="Channel contribution breakdown"
        >
            {/* Metric Toggle */}
            <div className="flex items-center gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
                {['spend', 'leads'].map(m => (
                    <button
                        key={m}
                        onClick={() => setMetric(m)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${metric === m
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Donut Chart */}
            <div className="h-52 w-full">
                {isEmpty ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 text-sm">No platform data</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                animationDuration={400}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend */}
            <div className="space-y-2.5 mt-4">
                {data?.map((platform, idx) => (
                    <div
                        key={platform.name}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer ${activeIndex === idx ? 'bg-gray-50' : 'hover:bg-gray-50'
                            }`}
                        onMouseEnter={() => setActiveIndex(idx)}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: platform.color }}
                            />
                            <span className="text-gray-600 font-medium">{platform.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{platform.value}%</span>
                    </div>
                ))}
            </div>
        </AnalyticsSection>
    );
};

export default PlatformSplit;
