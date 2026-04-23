/**
 * Build a short WebM slideshow from image URLs (including data: URLs) using Canvas + MediaRecorder.
 * Returns an object URL that must be revoked with URL.revokeObjectURL when discarded.
 *
 * @param {string[]} imageSrcs
 * @param {{ durationPerSlideMs?: number, totalDurationMs?: number, transitionMs?: number, width?: number, height?: number, fps?: number }} [options]
 * @returns {Promise<string>} object URL for video/webm
 */
export async function createSlideshowVideo(imageSrcs, options = {}) {
  const {
    durationPerSlideMs = 2200,
    totalDurationMs = 0,
    transitionMs = 450,
    width = 720,
    height = 1152,
    fps = 24,
  } = options;

  const sources = (imageSrcs || []).filter(Boolean);
  if (sources.length === 0) {
    throw new Error('No images provided for slideshow video');
  }

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if (!String(src).startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for video'));
      img.src = src;
    });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const baseSlideMs = Number(totalDurationMs) > 0
    ? Math.max(900, Math.floor(Number(totalDurationMs) / sources.length))
    : durationPerSlideMs;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const computeCover = (img) => {
    const ir = img.width / img.height;
    const cr = width / height;
    if (ir > cr) {
      const dh = height;
      const dw = height * ir;
      return { dw, dh, ox: (width - dw) / 2, oy: 0 };
    }
    const dw = width;
    const dh = width / ir;
    return { dw, dh, ox: 0, oy: (height - dh) / 2 };
  };

  const drawDynamicCover = (img, progress, alpha = 1, seed = 0) => {
    const { dw, dh, ox, oy } = computeCover(img);
    // Gentle Ken Burns motion to avoid "carousel-like" hard stills.
    const zoomStart = 1.05 + (seed % 3) * 0.01;
    const zoomEnd = zoomStart + 0.08;
    const zoom = zoomStart + (zoomEnd - zoomStart) * progress;

    const panX = ((seed % 2 === 0 ? 1 : -1) * (dw * 0.04) * progress);
    const panY = ((seed % 3 === 0 ? 1 : -1) * (dh * 0.03) * progress);

    const drawW = dw * zoom;
    const drawH = dh * zoom;
    const drawX = ox - (drawW - dw) / 2 + panX;
    const drawY = oy - (drawH - dh) / 2 + panY;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  };

  const mimeCandidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  });
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start(250);

  const frameDelay = Math.max(8, Math.floor(1000 / fps));

  const loadedImages = [];
  for (const src of sources) {
    loadedImages.push(await loadImage(src));
  }

  for (let idx = 0; idx < loadedImages.length; idx++) {
    const img = loadedImages[idx];
    const nextImg = loadedImages[(idx + 1) % loadedImages.length];
    const slideStart = performance.now();
    const slideEnd = slideStart + baseSlideMs;

    while (performance.now() < slideEnd) {
      const now = performance.now();
      const elapsed = now - slideStart;
      const p = clamp(elapsed / baseSlideMs, 0, 1);

      ctx.fillStyle = '#0f0f10';
      ctx.fillRect(0, 0, width, height);

      // Crossfade into next frame near the end for cinematic continuity.
      const inTransition = elapsed > baseSlideMs - transitionMs;
      const fadeP = inTransition ? clamp((elapsed - (baseSlideMs - transitionMs)) / transitionMs, 0, 1) : 0;

      drawDynamicCover(img, p, 1 - fadeP * 0.65, idx);
      if (inTransition && nextImg) {
        drawDynamicCover(nextImg, clamp(fadeP, 0, 1), fadeP * 0.85, idx + 1);
      }

      await new Promise((r) => setTimeout(r, frameDelay));
    }
  }

  recorder.stop();
  await stopped;

  const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
  if (!blob.size) {
    throw new Error('Video encoder produced an empty file — try another browser');
  }
  return URL.createObjectURL(blob);
}
