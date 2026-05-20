/**
 * parallax.js — Efecto parallax sutil del buggy del Hero
 * El buggy se mueve ligeramente siguiendo la posición del cursor.
 * Solo se activa en pantallas grandes y respeta `prefers-reduced-motion`.
 */

(function () {
  'use strict';

  const buggy = document.querySelector('.buggy-frame');
  if (!buggy) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (reduceMotion || isTouchDevice) return;

  // Amplitud del movimiento (px)
  const MAX_X = 14;
  const MAX_Y = 8;

  let ticking = false;
  let targetX = 0;
  let targetY = 0;

  function applyTransform() {
    buggy.style.transform = `translate(${targetX}px, ${targetY}px)`;
    ticking = false;
  }

  function onMouseMove(e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * MAX_X;
    targetY = (e.clientY / window.innerHeight - 0.5) * MAX_Y;

    if (!ticking) {
      window.requestAnimationFrame(applyTransform);
      ticking = true;
    }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
})();
