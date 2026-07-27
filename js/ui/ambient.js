/**
 * Darya ambient scene particles: bubbles, bird shadows, and wave
 * animation variation. Fully standalone -- no dependency on app state
 * or other UI modules.
 */
(function (global) {
  'use strict';

  /**
   * Returns a random number within [min, max).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Initializes randomized wave animation durations and delays for each
   * ocean layer in the beach scene. Each fresh conversation gets a unique
   * set of wave timings so the water motion never repeats exactly.
   * Also stores the average wave duration for bird shadow speed calculation.
   */
  function initBeachWaveVariation() {
    const layers = document.querySelectorAll('.beach-scene__ocean');
    const ranges = [[56, 72], [42, 58], [30, 46]];
    const durations = [];
    layers.forEach((layer, index) => {
      const [min, max] = ranges[index] || ranges[ranges.length - 1];
      const duration = randomBetween(min, max);
      durations.push(duration);
      layer.style.setProperty('--wave-duration', `${duration.toFixed(2)}s`);
      layer.style.setProperty('--wave-delay', `-${randomBetween(0, duration).toFixed(2)}s`);
    });
    const avgWave = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 48;
    document.documentElement.style.setProperty('--avg-wave-duration', String(avgWave));
  }

  /**
   * Creates floating bubble particles for the ocean theme. Each bubble
   * gets randomized size, duration, drift, and opacity for a natural,
   * organic feel. Only visible when the ocean theme is active.
   */
  function initBubbles() {
    const container = document.querySelector('.bubbles');
    if (!container) return;
    const count = 8;
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble-particle';
      const size = randomBetween(4, 14);
      const duration = randomBetween(14, 22);
      bubble.style.setProperty('--left', `${randomBetween(2, 96).toFixed(1)}%`);
      bubble.style.setProperty('--size', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      bubble.style.setProperty('--delay', `-${randomBetween(0, duration).toFixed(1)}s`);
      bubble.style.setProperty('--drift', `${randomBetween(-12, 12).toFixed(0)}px`);
      bubble.style.setProperty('--peak-opacity', randomBetween(0.15, 0.45).toFixed(2));
      container.appendChild(bubble);
    }
  }

  /**
   * Creates bird shadow silhouettes that drift across the beach scene.
   * Bird speed is linked to the average wave duration for a natural
   * visual balance, with random variance to prevent perfect syncing.
   * Only visible when the beach theme is active.
   */
  function initBirdShadows() {
    const container = document.querySelector('.bird-shadows');
    if (!container) return;
    const avgWaveDuration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--avg-wave-duration').trim()
    ) || 48;
    const flockCount = 2 + Math.floor(Math.random() * 3);
    for (let f = 0; f < flockCount; f += 1) {
      const birdsInFlock = 3 + Math.floor(Math.random() * 3);
      const waveFactor = randomBetween(0.35, 0.60);
      const flockDuration = avgWaveDuration * waveFactor + randomBetween(-3, 3);
      const clampedDuration = Math.max(14, Math.min(40, flockDuration));
      const flockDelay = -randomBetween(0, clampedDuration);
      const baseTop = randomBetween(8, 65);
      const baseScale = randomBetween(0.7, 1.2);
      for (let b = 0; b < birdsInFlock; b += 1) {
        const shadow = document.createElement('span');
        shadow.className = 'bird-shadow';
        shadow.style.setProperty('--top', `${(baseTop + randomBetween(-6, 8)).toFixed(1)}%`);
        shadow.style.setProperty('--scale', (baseScale * randomBetween(0.85, 1.15)).toFixed(2));
        shadow.style.setProperty('--duration', `${clampedDuration.toFixed(1)}s`);
        shadow.style.setProperty('--delay', `${flockDelay.toFixed(1)}s`);
        shadow.style.setProperty('--peak-opacity', randomBetween(0.25, 0.50).toFixed(2));
        shadow.style.setProperty('--flock-offset', `${randomBetween(-25, 25).toFixed(0)}px`);
        container.appendChild(shadow);
      }
    }
  }

  // Export for use by app.js and the test suite
  global.DaryaAmbient = {
    randomBetween,
    initBeachWaveVariation,
    initBubbles,
    initBirdShadows,
  };
})(typeof window !== 'undefined' ? window : globalThis);
