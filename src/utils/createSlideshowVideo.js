/**
 * Build a short WebM slideshow from image URLs (including data: URLs) using Canvas + MediaRecorder.
 * Returns an object URL that must be revoked with URL.revokeObjectURL when discarded.
 *
 * @param {string[]} imageSrcs
 * @param {{ durationPerSlideMs?: number, width?: number, height?: number, fps?: number }} [options]
 * @returns {Promise<string>} object URL for video/webm
 */
export async function createSlideshowVideo(imageSrcs, options = {}) {
  const {
    durationPerSlideMs = 2200,
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

  const drawCover = (img) => {
    ctx.fillStyle = '#0f0f10';
    ctx.fillRect(0, 0, width, height);
    const ir = img.width / img.height;
    const cr = width / height;
    let dw;
    let dh;
    let ox;
    let oy;
    if (ir > cr) {
      dh = height;
      dw = height * ir;
      ox = (width - dw) / 2;
      oy = 0;
    } else {
      dw = width;
      dh = width / ir;
      ox = 0;
      oy = (height - dh) / 2;
    }
    ctx.drawImage(img, ox, oy, dw, dh);
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

  for (const src of sources) {
    const img = await loadImage(src);
    const slideEnd = performance.now() + durationPerSlideMs;
    while (performance.now() < slideEnd) {
      drawCover(img);
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
