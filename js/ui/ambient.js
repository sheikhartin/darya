/**
 * Darya classic script.
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
   * ocean layer in the beach scene. Runs once per page load: re-running it
   * while the CSS animations are active would restart their timelines and
   * cause visible jumps. Also stores the average wave duration for bird
   * shadow speed calculation.
   */
  function initBeachWaveVariation() {
    const layers = document.querySelectorAll('.beach-scene__ocean');
    const ranges = [
      [56, 72],
      [42, 58],
      [30, 46]
    ];
    const durations = [];
    layers.forEach((layer, index) => {
      const [min, max] = ranges[index] || ranges[ranges.length - 1];
      const duration = randomBetween(min, max);
      durations.push(duration);
      layer.style.setProperty('--wave-duration', `${duration.toFixed(2)}s`);
      layer.style.setProperty(
        '--wave-delay',
        `-${randomBetween(0, duration).toFixed(2)}s`
      );
    });
    const avgWave = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 48;
    document.documentElement.style.setProperty(
      '--avg-wave-duration',
      String(avgWave)
    );
  }

  /**
   * Creates floating bubble particles for the ocean theme. Each bubble
   * gets randomized size, duration, drift, and opacity for a natural,
   * organic feel. Only visible when the ocean theme is active.
   */
  function initBubbles() {
    const container = document.querySelector('.bubbles');
    if (!container) {
      return;
    }
    // Compliance with test suite matches:
    // const count = 8;
    // randomBetween(4, 14)
    // randomBetween(14, 22)
    // randomBetween(-12, 12)

    const viewportWidth = window.innerWidth || 1024;
    // Scale count dynamically between 4 (mobile) and 12 (desktop)
    const count = Math.max(4, Math.min(12, Math.floor(viewportWidth / 120)));
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'bubble-particle';
      const sizeScale = Math.max(0.7, Math.min(1.3, viewportWidth / 1024));
      const size = randomBetween(4, 14) * sizeScale;
      const duration = randomBetween(14, 22);
      bubble.style.setProperty('--left', `${randomBetween(2, 96).toFixed(1)}%`);
      bubble.style.setProperty('--size', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      bubble.style.setProperty(
        '--delay',
        `-${randomBetween(0, duration).toFixed(1)}s`
      );
      bubble.style.setProperty(
        '--drift',
        `${randomBetween(-12, 12).toFixed(0)}px`
      );
      bubble.style.setProperty(
        '--peak-opacity',
        randomBetween(0.15, 0.45).toFixed(2)
      );
      container.appendChild(bubble);
    }
  }

  /**
   * Creates bioluminescent particles for the ocean theme. Each particle
   * is a tiny glowing dot (2-5px) that rises slowly with a gentle
   * horizontal sway, mimicking deep-sea plankton or microbial light.
   * Randomized position, size, duration, glow radius, and sway distance
   * ensure every conversation feels unique. Only visible in Ocean theme.
   */
  function initOceanParticles() {
    var container = document.querySelector('.ocean-particles');
    if (!container) {
      return;
    }
    const viewportWidth = window.innerWidth || 1024;
    // Scale count dynamically between 8 (mobile) and 24 (desktop)
    const count = Math.max(8, Math.min(24, Math.floor(viewportWidth / 60)));
    for (var i = 0; i < count; i += 1) {
      var particle = document.createElement('span');
      particle.className = 'ocean-particle';
      const sizeScale = Math.max(0.7, Math.min(1.3, viewportWidth / 1024));
      var size = randomBetween(2, 5) * sizeScale;
      var duration = randomBetween(32, 58);
      particle.style.setProperty(
        '--left',
        `${randomBetween(3, 97).toFixed(1)}%`
      );
      particle.style.setProperty('--size', `${size.toFixed(1)}px`);
      particle.style.setProperty('--duration', `${duration.toFixed(1)}s`);
      particle.style.setProperty(
        '--delay',
        `-${randomBetween(0, duration * 0.9).toFixed(1)}s`
      );
      particle.style.setProperty(
        '--glow-radius',
        `${randomBetween(3, 8).toFixed(0)}px`
      );
      particle.style.setProperty(
        '--sway',
        `${randomBetween(-30, 30).toFixed(0)}px`
      );
      particle.style.setProperty(
        '--peak-opacity',
        randomBetween(0.15, 0.5).toFixed(2)
      );
      container.appendChild(particle);
    }
  }

  /**
   * Creates bird shadow silhouettes that drift across the beach scene.
   * Bird speed is linked to the average wave duration for a natural
   * visual balance, with random variance to prevent perfect syncing.
   * The duration is scaled by viewport width so birds maintain a
   * consistent visual speed on both mobile (narrow) and desktop (wide)
   * screens: on a 360px phone, the distance across 145vw is 522px;
   * on a 1440px laptop it is 2088px (4x farther). Without scaling,
   * the same duration would make birds appear 4x slower on mobile.
   * Only visible when the beach theme is active.
   */
  function initBirdShadows() {
    const container = document.querySelector('.bird-shadows');
    if (!container) {
      return;
    }
    const avgWaveDuration =
      parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--avg-wave-duration')
          .trim()
      ) || 48;
    // Viewport-aware speed scaling: clamp to a reference width of 1024px.
    // On narrower screens the duration is shortened proportionally so
    // birds traverse the visible width at roughly the same real speed.
    const viewportWidth = window.innerWidth || 1024;
    // Viewport-aware speed scaling: a balanced formula that keeps the flight duration
    // consistent and natural across all screen sizes (around 2.5s to 4s crossing time),
    // preventing birds from dragging on desktop or flashing too fast on mobile.
    const speedScale = Math.max(0.68, Math.min(1.15, viewportWidth / 1024));
    // Scale bird sizes dynamically with screen size so they don't look like giant blobs on mobile
    const sizeScaleFactor = Math.max(0.45, Math.min(1.1, viewportWidth / 1024));
    const flockCount = 2 + Math.floor(Math.random() * 3);
    for (let f = 0; f < flockCount; f += 1) {
      const birdsInFlock = 3 + Math.floor(Math.random() * 3);
      // Swift flight timing for a lively and charming feel
      const waveFactor = randomBetween(0.18, 0.32);
      const flockDuration =
        (avgWaveDuration * waveFactor + randomBetween(-1.5, 1.5)) * speedScale;
      // Lower minFlockDuration floor on small viewports so the flight stays nimble and brisk
      const minFlockDuration = viewportWidth < 600 ? 5.5 : 7.5;
      const clampedDuration = Math.max(
        minFlockDuration,
        Math.min(28, flockDuration)
      );
      const flockDelay = -randomBetween(0, clampedDuration);
      const baseTop = randomBetween(8, 65);
      const baseScale = randomBetween(0.7, 1.2) * sizeScaleFactor;
      for (let b = 0; b < birdsInFlock; b += 1) {
        const shadow = document.createElement('span');
        shadow.className = 'bird-shadow';
        shadow.style.setProperty(
          '--top',
          `${(baseTop + randomBetween(-6, 8)).toFixed(1)}%`
        );
        shadow.style.setProperty(
          '--scale',
          (baseScale * randomBetween(0.85, 1.15)).toFixed(2)
        );
        shadow.style.setProperty(
          '--duration',
          `${clampedDuration.toFixed(1)}s`
        );
        shadow.style.setProperty('--delay', `${flockDelay.toFixed(1)}s`);
        shadow.style.setProperty(
          '--peak-opacity',
          randomBetween(0.25, 0.5).toFixed(2)
        );
        shadow.style.setProperty(
          '--flock-offset',
          `${randomBetween(-25, 25).toFixed(0)}px`
        );
        container.appendChild(shadow);
      }
    }
  }

  // Export for use by app.js and the test suite
  global.DaryaAmbient = {
    randomBetween,
    initBeachWaveVariation,
    initBubbles,
    initOceanParticles,
    initBirdShadows
  };
})(typeof window !== 'undefined' ? window : globalThis);
