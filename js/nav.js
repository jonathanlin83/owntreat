(function () {
  const burger = document.querySelector('.navbar__burger');
  const menu = document.getElementById('mobile-menu');
  const navbar = document.querySelector('.navbar');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-hidden', String(isOpen));
      burger.classList.toggle('is-open', !isOpen);
      menu.classList.toggle('is-open', !isOpen);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        burger.classList.remove('is-open');
        menu.classList.remove('is-open');
      });
    });
  }

  /* Center pricing card on anchor click */
  document.querySelectorAll('a[href="#pricing"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const card = document.querySelector('.cta-final__card');
      if (card) {
        e.preventDefault();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* Shadow + hide-on-scroll-down / show-on-scroll-up */
  if (navbar) {
    let lastScrollY = window.scrollY;
    const HIDE_THRESHOLD = 60;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      navbar.classList.toggle('navbar--scrolled', currentScrollY > 16);

      if (!menu.classList.contains('is-open')) {
        if (currentScrollY > HIDE_THRESHOLD) {
          navbar.classList.toggle('navbar--hidden', currentScrollY > lastScrollY);
        } else {
          navbar.classList.remove('navbar--hidden');
        }
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }
})();
