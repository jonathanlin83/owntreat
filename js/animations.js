(function () {
  const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .pop');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.style.getPropertyValue('--delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Number(delay) * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => observer.observe(el));
})();

(function () {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const now = new Date();
  
  // Get the last day of the current month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthName = MONTHS[now.getMonth()];

  const btn = document.querySelector('[data-deadline-btn]');
  if (btn) btn.textContent = `Join Free Before ${monthName} ${lastDay}`;
})();

(function () {
  const counters = document.querySelectorAll('.stats__count');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const duration = 1400;
      const start = performance.now();
      observer.unobserve(el);

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => observer.observe(el));
})();

(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headline = document.querySelector('[data-typewriter]');
  if (!headline) return;

  const parts = Array.from(headline.querySelectorAll('[data-tw-text]'));
  if (!parts.length) return;

  // If reduced motion is requested, render instantly and skip the typing effect.
  if (prefersReduced) {
    parts.forEach((el) => { el.textContent = el.getAttribute('data-tw-text') || ''; });
    return;
  }

  headline.classList.add('has-typewriter');

  const original = parts.map((el) => el.getAttribute('data-tw-text') || '');
  parts.forEach((el) => { el.textContent = ''; });

  const speedMs = 20;      // per character (faster)
  const betweenMs = 180;   // between segments
  const startDelayMs = 80;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function typeInto(el, text) {
    el.classList.add('is-typing');
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      // Small jitter so it feels less robotic.
      await sleep(speedMs + (i % 3 === 0 ? 10 : 0));
    }
    el.classList.remove('is-typing');
  }

  let started = false;
  async function start() {
    if (started) return;
    started = true;
    await sleep(startDelayMs);
    for (let i = 0; i < parts.length; i++) {
      await typeInto(parts[i], original[i]);
      await sleep(betweenMs);
    }
    headline.classList.add('typing-done');
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        obs.disconnect();
        start();
      }
    });
  }, { threshold: 0.35 });

  obs.observe(headline);
})();
