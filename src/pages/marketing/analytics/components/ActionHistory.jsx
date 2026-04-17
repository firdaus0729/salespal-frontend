import React from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';

const ActionHistory = ({ history }) => {
    return (
        <div className="flex flex-col mt-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                History
            </h3>

            <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
                {history && history.map((item) => (
                    <div key={item.id} className="p-3 flex items-start gap-3">
                        <div className={`mt-0.5 ${item.status === 'Applied' ? 'text-green-500' :
                                item.status === 'Ignored' ? 'text-gray-300' : 'text-blue-500'
                            }`}>
                            {item.status === 'Applied' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.action}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">{item.date}</span>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className="text-[10px] text-gray-500">{item.scope}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionHistory;
