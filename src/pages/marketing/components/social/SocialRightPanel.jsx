import React from 'react';
import { Sparkles, CalendarCheck, TrendingUp, AlertCircle } from 'lucide-react';
import SocialPreview from './SocialPreview';
import Card from '../../../../components/ui/Card';

const SocialRightPanel = ({ content }) => {
    return (
        <div className="h-full flex flex-col bg-gray-50/30 border-l border-gray-200 p-6 overflow-y-auto w-full">
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h3>
                <div className="flex justify-center">
                    <SocialPreview content={content} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    AI Insights
                </h3>

                {/* Posting Time Insight */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Optimal Time</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Your audience is most active tomorrow at <span className="text-green-600 font-medium">9:00 AM</span>.
                            </p>
                            <button className="text-xs font-medium text-primary mt-2 hover:underline">Apply Reccomendation</button>
                        </div>
                    </div>
                </div>

                {/* Engagement Prediction */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Predicted Reach</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-bold text-gray-900">3.2k - 4.5k</span>
                                <span className="text-xs text-gray-500">views</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warnings/Tips */}
                {content.length < 50 && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-800 leading-relaxed">
                            Short captions may have lower engagement. Try adding a question or call-to-action.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialRightPanel;
