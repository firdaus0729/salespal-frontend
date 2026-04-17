import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot
} from 'recharts';
import { Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { usePreferences } from '../../../../context/PreferencesContext';

const PerformanceStability = ({ data, compareMode, previousData }) => {
    const { formatCurrency } = usePreferences();
    // data format: { dates: [], roas: [], cpa: [] }

    // Process data for Recharts
    const chartData = useMemo(() => {
        if (!data || !data.dates) return [];
        return data.dates.map((date, index) => {
            const point = {
                date,
                roas: Number(data.roas[index] || 0),
                cpa: Number(data.cpa[index] || 0),
            };
            
            if (compareMode && previousData) {
                point.prevRoas = Number(previousData.roas[index] || 0);
                point.prevCpa = Number(previousData.cpa[index] || 0);
            }
            
            return point;
        });
    }, [data, compareMode, previousData]);

    // Calculate Dynamic Domains for Better Visual Balance
    // We want to avoid squashing either metric by giving them appropriate padding.
    const axisDomains = useMemo(() => {
        if (chartData.length === 0) return { roas: ['auto', 'auto'], cpa: ['auto', 'auto'] };

        const roasVals = chartData.flatMap(d => compareMode ? [d.roas, d.prevRoas] : [d.roas]);
        const cpaVals = chartData.flatMap(d => compareMode ? [d.cpa, d.prevCpa] : [d.cpa]);

        const minRoas = Math.min(...roasVals.filter(v => v !== undefined && !isNaN(v)));
        const maxRoas = Math.max(...roasVals.filter(v => v !== undefined && !isNaN(v)));
        const minCpa = Math.min(...cpaVals.filter(v => v !== undefined && !isNaN(v)));
        const maxCpa = Math.max(...cpaVals.filter(v => v !== undefined && !isNaN(v)));

        // Add ~10-20% padding
        const roasPad = (maxRoas - minRoas) * 0.2 || 0.5;
        const cpaPad = (maxCpa - minCpa) * 0.2 || 50;

        return {
            roas: [Math.max(0, minRoas - roasPad).toFixed(2), (maxRoas + roasPad).toFixed(2)],
            cpa: [Math.max(0, minCpa - cpaPad).toFixed(0), (maxCpa + cpaPad).toFixed(0)]
        };
    }, [chartData]);


    // Anomaly Detection Logic
    const anomalies = useMemo(() => {
        if (chartData.length === 0) return { maxROAS: null, minROAS: null, maxCPA: null };

        // Find Max ROAS
        const maxROAS = chartData.reduce((prev, current) => (prev.roas > current.roas) ? prev : current, chartData[0]);
        // Find Min ROAS
        const minROAS = chartData.reduce((prev, current) => (prev.roas < current.roas) ? prev : current, chartData[0]);
        // Find Max CPA (Spike)
        const maxCPA = chartData.reduce((prev, current) => (prev.cpa > current.cpa) ? prev : current, chartData[0]);

        // Calculate volatility (standard deviation estimate)
        const avgRoas = chartData.reduce((sum, d) => sum + d.roas, 0) / chartData.length;
        const roasVariance = chartData.reduce((sum, d) => sum + Math.pow(d.roas - avgRoas, 2), 0) / chartData.length;
        const isVolatile = Math.sqrt(roasVariance) > 0.5; // Threshold for volatility

        return { maxROAS, minROAS, maxCPA, isVolatile };
    }, [chartData]);

    // AI Insight Generator
    const getAIInsight = () => {
        if (chartData.length < 3) return { text: "Insufficient data for detailed stability analysis.", type: "neutral" };

        if (!compareMode) {
            const { maxROAS, maxCPA, isVolatile } = anomalies;
            const lastDay = chartData[chartData.length - 1];

            // Priority 1: Recent CPA Spike
            if (maxCPA && lastDay && maxCPA.date === lastDay.date && maxCPA.cpa > 500) {
                return { text: `CPA spiked recently on ${maxCPA.date}. Consider reviewing audience targeting or bid strategy.`, type: "warning" };
            }
            // Priority 2: Volatility check
            if (isVolatile) {
                return { text: `ROAS peaked on ${maxROAS.date}, but performance shows significant daily volatility. Efficiency is fluctuating.`, type: "neutral" };
            }
            // Priority 3: ROAS Peak
            if (maxROAS && chartData.length > 0 && maxROAS.roas > 3.5) {
                return { text: `ROAS peaked on ${maxROAS.date}, showing strong efficiency. CPA remained relatively stable during this peak.`, type: "positive" };
            }
            // Priority 4: Stable
            return { text: "Performance remained stable with minor fluctuations. Efficiency is consistent.", type: "neutral" };
        }

        // --- Compare Mode Insights ---
        const currentRoasAvg = chartData.reduce((sum, d) => sum + (d.roas || 0), 0) / chartData.length;
        const prevRoasAvg = chartData.reduce((sum, d) => sum + (d.prevRoas || 0), 0) / chartData.length;
        const currentCpaAvg = chartData.reduce((sum, d) => sum + (d.cpa || 0), 0) / chartData.length;
        const prevCpaAvg = chartData.reduce((sum, d) => sum + (d.prevCpa || 0), 0) / chartData.length;

        if (prevRoasAvg > 0 && prevCpaAvg > 0) {
            const roasDiff = ((currentRoasAvg - prevRoasAvg) / prevRoasAvg) * 100;
            const cpaDiff = ((currentCpaAvg - prevCpaAvg) / prevCpaAvg) * 100;

            if (roasDiff > 5) {
                if (cpaDiff > 5) {
                    return { text: `ROAS improved by ${Math.abs(roasDiff).toFixed(0)}%, but CPA also increased. Monitor acquisition costs closely.`, type: 'warning' };
                }
                return { text: `ROAS improved by ${Math.abs(roasDiff).toFixed(0)}% compared to the previous period. Great efficiency!`, type: "positive" };
            } else if (roasDiff < -5) {
                return { text: `ROAS dropped by ${Math.abs(roasDiff).toFixed(0)}% compared to the previous period. Ad efficiency is suffering.`, type: "warning" };
            } else if (cpaDiff > 10) {
                return { text: `CPA increased by ${Math.abs(cpaDiff).toFixed(0)}%, indicating reduced efficiency in acquiring customers.`, type: "warning" };
            } else if (cpaDiff < -10) {
                return { text: `CPA decreased by ${Math.abs(cpaDiff).toFixed(0)}%. Customer acquisition became notably more efficient.`, type: "positive" };
            } else {
                return { text: `Performance remained highly stable across both periods with negligible efficiency drift.`, type: "neutral" };
            }
        }
        
        return { text: "Comparing current period against historical data to measure relative stability.", type: "neutral" };
    };

    const insight = getAIInsight();

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center justify-between xl:items-start flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Performance Stability</h3>
                    </div>
                    {/* Legend Badges */}
                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded border border-emerald-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-emerald-700">ROAS</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded border border-rose-100">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-xs font-bold text-rose-700">CPA</span>
                            </div>
                        </div>
                        {compareMode && (
                            <div className="flex gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 border-b-2 border-gray-400"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Current Period</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 border-b-2 border-gray-400 border-dashed"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Previous Period</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 ml-12">
                    {compareMode 
                        ? 'Comparing current period vs previous period' 
                        : 'ROAS and CPA behavior over the selected period'}
                </p>
            </div>

            {/* Chart Area */}
            <div className="h-52 w-full mt-2 ml-[-10px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            dy={10}
                        />
                        {/* Left Axis: ROAS */}
                        <YAxis
                            yAxisId="left"
                            hide
                            domain={axisDomains.roas}
                        />
                        {/* Right Axis: CPA */}
                        <YAxis
                            yAxisId="right"
                            hide
                            orientation="right"
                            domain={axisDomains.cpa}
                        />

                        <Tooltip content={
                            ({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-sm min-w-[200px]">
                                            <p className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{label}</p>
                                            
                                            {['roas', 'cpa'].map(metric => {
                                                const curr = payload.find(p => p.dataKey === metric);
                                                const prev = payload.find(p => p.dataKey === (metric === 'roas' ? 'prevRoas' : 'prevCpa'));
                                                
                                                if (!curr) return null;
                                                
                                                const isCpa = metric === 'cpa';
                                                const metricLabel = isCpa ? 'CPA' : 'ROAS';
                                                const formatVal = (v) => isCpa ? formatCurrency(v) : `${v}x`;
                                                const colorClass = isCpa ? 'text-rose-600' : 'text-emerald-600';

                                                let pctChangeStr = null;
                                                if (compareMode && prev && prev.value > 0) {
                                                    const pct = ((curr.value - prev.value) / prev.value) * 100;
                                                    const isPositive = pct >= 0;
                                                    // For CPA lower is better. For ROAS higher is better.
                                                    const isGood = isCpa ? pct <= 0 : pct >= 0;
                                                    pctChangeStr = (
                                                        <span className={`text-xs ml-2 font-bold ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {isPositive ? '↑ +' : '↓ '}{pct.toFixed(1)}%
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <div key={metric} className="mb-4 last:mb-0">
                                                        <div className={`font-semibold mb-2 uppercase text-[10px] tracking-wider ${colorClass}`}>
                                                            {metricLabel} Breakdown
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-gray-900 leading-none">
                                                                <span className="text-xs font-medium text-gray-500 w-16">Current:</span>
                                                                <span className="font-bold text-sm tracking-tight">{formatVal(curr.value)}</span>
                                                            </div>
                                                            {compareMode && prev && (
                                                                <>
                                                                    <div className="flex justify-between items-center text-gray-500 leading-none">
                                                                        <span className="text-xs w-16">Previous:</span>
                                                                        <span className="font-medium text-xs font-mono">{formatVal(prev.value)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-gray-900 pt-1.5 mt-1.5 border-t border-gray-100 leading-none">
                                                                        <span className="text-xs font-medium text-gray-500 w-16">Change:</span>
                                                                        {pctChangeStr}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            }
                        } />

                        {/* ROAS Lines */}
                        {compareMode && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="prevRoas"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981', opacity: 0.6 }}
                                isAnimationActive={true}
                                opacity={0.65}
                            />
                        )}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="roas"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                            isAnimationActive={true}
                        />

                        {/* CPA Lines */}
                        {compareMode && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="prevCpa"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e', opacity: 0.6 }}
                                isAnimationActive={true}
                                opacity={0.65}
                            />
                        )}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="cpa"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ r: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                            isAnimationActive={true}
                        />

                        {/* Anomaly Dots */}
                        {anomalies.maxROAS && (
                            <ReferenceDot
                                yAxisId="left"
                                x={anomalies.maxROAS.date}
                                y={anomalies.maxROAS.roas}
                                r={4}
                                fill="#10b981"
                                stroke="#fff"
                                strokeWidth={2}
                                isFront={true}
                            />
                        )}
                        {anomalies.maxCPA && (
                            <ReferenceDot
                                yAxisId="right"
                                x={anomalies.maxCPA.date}
                                y={anomalies.maxCPA.cpa}
                                r={4}
                                fill="#f43f5e"
                                stroke="#fff"
                                strokeWidth={2}
                                isFront={true}
                            />
                        )}

                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* AI Micro Insight */}
            <div className={`mt-4 rounded-lg p-3 text-sm flex items-start gap-2 border ${insight.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    'bg-gray-50 border-gray-100 text-gray-600'
                }`}>
                {insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> :
                    insight.type === 'positive' ? <Zap className="w-4 h-4 mt-0.5 shrink-0" /> :
                        <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />}
                <p className="font-medium leading-snug">{insight.text}</p>
            </div>
        </div>
    );
};

export default PerformanceStability;
