/**
 * Device & performance tier detection.
 * Helps keep 60fps smooth on mobile and low-end devices by scaling
 * particle counts, DPR (devicePixelRatio), and bloom post-processing.
 */
export function getPerformanceProfile() {
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(ua) || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // GB (may be undefined on iOS)
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Low-end heuristic: <= 2 cores or <= 2GB RAM, or older mobile GPUs
  const isLowEnd = cores <= 2 || memory <= 2 || (isMobile && cores <= 4 && memory <= 3);

  return {
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    // Cap pixel ratio so high-DPI phones don't melt the GPU
    maxPixelRatio: isLowEnd ? 1 : isMobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 2),
    // Disable UnrealBloomPass on low-end devices as a performance-friendly fallback
    useBloom: !isLowEnd,
    bloomStrength: isMobile ? 0.55 : 0.72,
    // Scale particle counts gracefully
    particleScale: isLowEnd ? 0.35 : isMobile ? 0.65 : 1.0,
  };
}
