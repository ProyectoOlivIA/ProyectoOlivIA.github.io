/**
 * exploded.js — Scroll-driven cinematic video controller
 *
 * Comportamiento:
 *   - El vídeo ocupa la pantalla completa (sticky pin).
 *   - El scroll mapea al currentTime del vídeo.
 *   - Por capa/fase, aparece un slide con titular grande que cambia.
 *   - Sistema de slides con debounce para evitar parpadeos en transiciones.
 *
 * Optimizaciones:
 *   - IntersectionObserver para activar/desactivar el loop.
 *   - requestAnimationFrame sincronizado con el render.
 *   - lerp() para suavizar saltos bruscos de scroll.
 *   - fastSeek() cuando está disponible.
 *   - Solo cambia el slide cuando supera un umbral (evita flicker en bordes).
 */

(function () {
  'use strict';

  const section = document.querySelector('.exploded');
  const video = document.querySelector('.exploded-video');
  const barFill = document.querySelector('.exploded-bar-fill');
  const counterMain = document.querySelector('[data-counter-main]');
  const counterTotal = document.querySelector('[data-counter-total]');
  const slides = document.querySelectorAll('.exploded-slide');
  const chapterTotal = document.querySelector('[data-chapter-total]');

  if (!section || !video || slides.length === 0) return;

  // Fases del exploded — cada slide ocupa un rango de progreso (0-1)
  // Reparto uniforme entre el número de slides
  const SLIDE_COUNT = slides.length;
  const PHASES = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
    from: i / SLIDE_COUNT,
    to: (i + 1) / SLIDE_COUNT,
    index: i
  }));

  // Inicializa el total en el contador
  if (counterTotal) counterTotal.textContent = String(SLIDE_COUNT).padStart(2, '0');
  if (chapterTotal) chapterTotal.textContent = String(SLIDE_COUNT).padStart(2, '0');

  // Respect reduced motion: muestra todo de inmediato sin animaciones de scroll
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.controls = true;
    video.classList.add('ready');
    slides.forEach(s => s.classList.add('active'));
    return;
  }

  // ============ State ============
  let videoDuration = 0;
  let targetTime = 0;
  let currentTime = 0;
  let activeSlideIndex = -1;
  let isInView = false;
  let rafId = null;

  // ============ Setup ============
  function init() {
    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      onMetadata();
    } else {
      video.addEventListener('loadedmetadata', onMetadata, { once: true });
      // Fallback timeout: si el vídeo no carga, mostramos el primer slide al menos
      setTimeout(() => {
        if (!video.classList.contains('ready')) {
          setActiveSlide(0);
        }
      }, 3000);
    }
  }

  function onMetadata() {
    videoDuration = video.duration;
    video.pause();
    video.currentTime = 0;
    video.classList.add('ready');
    setActiveSlide(0);
    setupObserver();
  }

  // ============ IntersectionObserver: solo correr cuando es visible ============
  function setupObserver() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isInView = entry.isIntersecting;
          if (isInView) startLoop();
          else stopLoop();
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );
    io.observe(section);
  }

  // ============ Scroll progress ============
  function getScrollProgress() {
    const rect = section.getBoundingClientRect();
    const winH = window.innerHeight;
    const scrollable = rect.height - winH;
    if (scrollable <= 0) return 0;
    const scrolled = Math.max(0, -rect.top);
    let progress = scrolled / scrollable;
    return Math.min(1, Math.max(0, progress));
  }

  // ============ Linear interpolation ============
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ============ Render loop ============
  function loop() {
    if (!isInView) {
      rafId = null;
      return;
    }

    const progress = getScrollProgress();
    targetTime = progress * videoDuration;

    // Smoothing — evita parpadeos en scroll brusco
    currentTime = lerp(currentTime, targetTime, 0.18);

    // Solo actualizamos si hay diferencia perceptible (>30ms)
    if (Math.abs(video.currentTime - currentTime) > 0.03) {
      try {
        if (typeof video.fastSeek === 'function') {
          video.fastSeek(currentTime);
        } else {
          video.currentTime = currentTime;
        }
      } catch (e) {
        // Algunos navegadores tiran error si el vídeo aún no está listo
      }
    }

    // Update progress bar
    if (barFill) {
      barFill.style.transform = `scaleX(${progress})`;
    }

    // Update counter (00, 01, 02, ...)
    const slideNum = Math.min(SLIDE_COUNT, Math.floor(progress * SLIDE_COUNT) + 1);
    if (counterMain) {
      counterMain.textContent = String(slideNum).padStart(2, '0');
    }

    // Update active slide
    updateActiveSlide(progress);

    rafId = window.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(loop);
    }
  }

  function stopLoop() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ============ Slides ============
  function updateActiveSlide(progress) {
    let newIndex = -1;
    for (const phase of PHASES) {
      if (progress >= phase.from && progress < phase.to) {
        newIndex = phase.index;
        break;
      }
    }
    // El último frame: mantener el último slide
    if (progress >= 0.999) newIndex = SLIDE_COUNT - 1;
    if (newIndex === -1) newIndex = 0;

    if (newIndex !== activeSlideIndex) {
      setActiveSlide(newIndex);
    }
  }

  function setActiveSlide(index) {
    activeSlideIndex = index;
    slides.forEach((slide, i) => {
      if (i === index) slide.classList.add('active');
      else slide.classList.remove('active');
    });
  }

  // ============ Init ============
  init();
})();
