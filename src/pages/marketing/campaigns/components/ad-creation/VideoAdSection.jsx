import React from 'react';
import { Upload, PlayCircle, Sparkles } from 'lucide-react';
import { useSubscription } from '../../../../../commerce/SubscriptionContext';
import api from '../../../../../lib/api';

const VideoAdSection = () => {
    const { canConsume, consume } = useSubscription();
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [jobId, setJobId] = React.useState(null);
    const [status, setStatus] = React.useState('idle');
    const [videoUrl, setVideoUrl] = React.useState(null);
    const [error, setError] = React.useState(null);

    const handleGenerateVideo = async () => {
        if (!canConsume('marketing', 'videos')) {
            alert('You have reached your monthly video limit.');
            return;
        }
        setError(null);
        setIsGenerating(true);
        setStatus('queued');
        try {
            const job = await api.post('/ai/video/jobs', {
                prompt: 'Generate a short promotional product ad video.',
                objective: 'Awareness',
                locale: 'en',
            });
            const id = job?.job_id || job?.id;
            if (!id) throw new Error('Video job ID not returned');
            setJobId(id);
            setStatus('running');
            consume('marketing', 'videos');
        } catch (err) {
            setStatus('failed');
            setError(err?.message || 'Video generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    React.useEffect(() => {
        if (!jobId) return;
        let timer = null;
        let cancelled = false;

        const poll = async () => {
            try {
                const data = await api.get(`/ai/video/jobs/${jobId}`);
                const state = data?.status || data?.state || 'running';
                if (cancelled) return;
                setStatus(state);
                const candidateUrl = data?.video_url || data?.result?.video_url || data?.result?.videoUrl || null;
                if (candidateUrl) {
                    setVideoUrl(candidateUrl);
                }
                if (!['done', 'completed', 'failed', 'error', 'rejected'].includes(String(state).toLowerCase())) {
                    timer = setTimeout(poll, 4000);
                }
            } catch (err) {
                if (cancelled) return;
                setStatus('failed');
                setError(err?.message || 'Could not fetch video job status');
            }
        };

        poll();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [jobId]);

    return (
        <div className="space-y-4 animate-fade-in-up">
            <h4 className="text-sm font-semibold text-gray-900">Video Creatives</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Video Preview */}
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden group border border-gray-200 flex items-center justify-center sm:col-span-2">
                    {videoUrl ? (
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                    ) : (
                        <PlayCircle className="w-12 h-12 text-white/80" />
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                        {isGenerating ? 'Generating...' : status}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-secondary hover:bg-secondary/5 transition-all text-gray-500 hover:text-secondary">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-medium">Upload Video</span>
                    </button>
                    <button
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-secondary hover:bg-secondary/5 transition-all text-gray-500 hover:text-secondary"
                        onClick={handleGenerateVideo}
                        disabled={isGenerating}
                    >
                        <Sparkles className="w-6 h-6" />
                        <span className="text-xs font-medium">Generate Video</span>
                    </button>
                </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default VideoAdSection;
