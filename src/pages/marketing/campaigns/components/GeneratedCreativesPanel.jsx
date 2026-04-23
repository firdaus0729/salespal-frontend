import React from 'react';
import { Layers, Image as ImageIcon, Video } from 'lucide-react';
import CreativeVideoFromImages from './CreativeVideoFromImages';

/**
 * Shows hero image, horizontal carousel of slides, and buildable slideshow video.
 */
export default function GeneratedCreativesPanel({ chosenCampaign, selectedAdFormat, videoDurationSec = 12 }) {
  if (!chosenCampaign) return null;

  const slides =
    (chosenCampaign.carouselImages?.length && chosenCampaign.carouselImages) ||
    chosenCampaign.images ||
    [chosenCampaign.imageUrl || chosenCampaign.image].filter(Boolean);
  const videoPrompt = [
    `Brand campaign: ${chosenCampaign.campaignName || chosenCampaign.campaignTitle || 'Campaign'}`,
    `Primary message: ${chosenCampaign.primaryText || chosenCampaign.descriptions?.[0] || ''}`,
    `Headline: ${chosenCampaign.headlines?.[0] || ''}`,
    'Create a lifelike, dynamic promotional video with natural movement and human presence.',
  ]
    .filter(Boolean)
    .join('\n');

  if (!slides.length) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
        No AI images were returned for this campaign. Try regenerating ads, or check that your backend can reach the
        image provider (Vertex Imagen or Pollinations fallback).
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-blue-50/80 to-indigo-50/50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          AI creatives
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Format: <span className="font-medium text-gray-700">{selectedAdFormat || 'image'}</span>
          {' · '}
          {slides.length} slide{slides.length !== 1 ? 's' : ''}
          {' · '}
          Video {videoDurationSec}s
        </p>
      </div>

      <div className="p-4 space-y-5">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Hero
          </p>
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square max-h-56 mx-auto">
            <img src={slides[0]} alt="Primary creative" className="w-full h-full object-cover" />
          </div>
        </div>

        {slides.length > 1 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Carousel slides
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {slides.map((src, i) => (
                <div
                  key={i}
                  className="shrink-0 w-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex flex-col bg-white"
                >
                  <div className="aspect-[4/5] w-full bg-gray-100">
                    <img src={src} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center text-[9px] font-semibold text-gray-500 py-0.5 bg-gray-50 border-t border-gray-100">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Video className="w-3 h-3" />
            Video preview
          </p>
          <CreativeVideoFromImages
            imageUrls={slides}
            durationSec={videoDurationSec}
            videoPrompt={videoPrompt}
            requireAiVideo={selectedAdFormat === 'video'}
          />
        </div>
      </div>
    </div>
  );
}
