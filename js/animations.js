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
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  const label = MONTHS[next.getMonth()];

  const btn = document.querySelector('[data-deadline-btn]');
  if (btn) btn.textContent = `Join Free — Until ${label}`;

  const sub = document.querySelector('[data-deadline-sub]');
  if (sub) sub.textContent =
    `Sign up now and get full access — completely free until ${label}. No credit card. No commitment.`;
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
