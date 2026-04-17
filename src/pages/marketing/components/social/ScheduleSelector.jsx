import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const ScheduleSelector = ({ scheduleMode, onModeChange }) => {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Publishing Options</h4>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="schedule"
                        className="text-secondary focus:ring-secondary"
                        checked={scheduleMode === 'now'}
                        onChange={() => onModeChange('now')}
                    />
                    <span className="text-sm text-gray-800">Post Now</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="schedule"
                        className="text-secondary focus:ring-secondary"
                        checked={scheduleMode === 'later'}
                        onChange={() => onModeChange('later')}
                    />
                    <span className="text-sm text-gray-800">Schedule</span>
                </label>
            </div>

            {scheduleMode === 'later' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in-up space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input type="date" className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                            <div className="relative">
                                <Clock className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input type="time" className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary" />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right">Timezone: Asia/Kolkata</p>
                </div>
            )}
        </div>
    );
};

export default ScheduleSelector;
