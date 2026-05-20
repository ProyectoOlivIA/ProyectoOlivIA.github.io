/**
 * nav.js — Comportamiento de la barra de navegación
 * Añade clase `.scrolled` cuando se hace scroll para activar el efecto glassmorphism.
 */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 40;
  let ticking = false;

  function updateNavState() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    // requestAnimationFrame para no saturar el main thread
    if (!ticking) {
      window.requestAnimationFrame(updateNavState);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Estado inicial
  updateNavState();
})();
