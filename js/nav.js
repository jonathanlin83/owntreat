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

  /* Sticky shadow on scroll */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 16);
    }, { passive: true });
  }
})();
