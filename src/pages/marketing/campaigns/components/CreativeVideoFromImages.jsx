import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, Video, AlertCircle } from 'lucide-react';
import { createSlideshowVideo } from '../../../../utils/createSlideshowVideo';
import api from '../../../../lib/api';

/**
 * Encodes slides as a WebM slideshow the user can play inline.
 */
export default function CreativeVideoFromImages({
  imageUrls,
  durationSec = 12,
  videoPrompt = '',
  className = '',
}) {
  const key = useMemo(
    () => `${(imageUrls || []).filter(Boolean).join('|')}::${durationSec}::${videoPrompt}`,
    [imageUrls, durationSec, videoPrompt]
  );
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [videoSource, setVideoSource] = useState('local');

  useEffect(() => {
    const urls = (imageUrls || []).filter(Boolean);
    if (urls.length === 0) {
      setVideoUrl(null);
      setError(null);
      setBusy(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl;

    (async () => {
      setBusy(true);
      setError(null);
      setVideoUrl(null);
      setVideoSource('local');
      try {
        const promptText =
          videoPrompt ||
          'Create a realistic, lifelike promotional video with dynamic motion and natural human presence.';

        let remoteVideo = null;
        try {
          const job = await api.post('/ai/video/jobs', {
            prompt: promptText,
            objective: 'Conversions',
            locale: 'en',
            durationSec: Math.max(4, Number(durationSec) || 12),
            aspectRatio: '9:16',
            referenceImageUrl: urls[0] || '',
          });
          const jobId = job?.job_id || job?.id;
          if (jobId) {
            const started = Date.now();
            while (Date.now() - started < 180000 && !cancelled) {
              const s = await api.get(`/ai/video/jobs/${jobId}`);
              const state = String(s?.status || '').toLowerCase();
              if (state === 'completed' || state === 'done') {
                remoteVideo = s?.video_url || s?.result?.video_url || s?.result?.videoUrl || null;
                break;
              }
              if (state === 'failed' || state === 'error') {
                break;
              }
              await new Promise((r) => setTimeout(r, 3500));
            }
          }
        } catch (_) {
          // Silent fallback to local render when remote provider isn't configured.
          remoteVideo = null;
        }

        if (remoteVideo) {
          if (!cancelled) {
            setVideoSource('ai');
            setVideoUrl(remoteVideo);
          }
          return;
        }

        objectUrl = await createSlideshowVideo(urls, {
          totalDurationMs: Math.max(4, Number(durationSec) || 12) * 1000,
          durationPerSlideMs: 2000,
          transitionMs: 500,
          width: 720,
          height: 1152,
          fps: 24,
        });
        if (!cancelled) {
          setVideoSource('local');
          setVideoUrl(objectUrl);
        } else URL.revokeObjectURL(objectUrl);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Video build failed');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key]);

  if (!imageUrls?.length) {
    return (
      <div className={`rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 p-8 text-gray-500 text-sm ${className}`}>
        <Video className="w-8 h-8 opacity-40" />
        <span>Add generated images to preview video</span>
      </div>
    );
  }

  if (busy) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-gray-900/5 flex flex-col items-center justify-center gap-3 p-10 ${className}`}>
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Building a dynamic {durationSec}s video from {imageUrls.length} AI slides...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50/80 flex items-start gap-2 p-4 text-sm text-red-800 ${className}`}>
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!videoUrl) return null;

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 bg-black shadow-md ${className}`}>
      <video src={videoUrl} controls playsInline className="w-full max-h-[480px] object-contain bg-black" />
      <p className="text-[11px] text-gray-500 px-3 py-2 bg-gray-50 border-t border-gray-100">
        {videoSource === 'ai'
          ? 'AI-generated motion video (server-side provider).'
          : 'Motion preview generated in-browser with cinematic pan/zoom + smooth transitions (fallback).'}
      </p>
    </div>
  );
}
