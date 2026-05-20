/**
 * reveal.js — Scroll reveal con IntersectionObserver
 * Añade la clase `.in` a los elementos `.reveal` cuando entran en viewport.
 * Respeta `prefers-reduced-motion`.
 */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reveals.length === 0) return;

  // Si el usuario prefiere menos movimiento, mostramos todo de inmediato
  if (reduceMotion) {
    reveals.forEach(el => el.classList.add('in'));
    return;
  }

  // Soporte para navegadores sin IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  reveals.forEach(el => observer.observe(el));
})();
