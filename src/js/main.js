// ============================================================
// Hamburger menu toggle
// ============================================================
(function () {
  var burger = document.getElementById('header-burger');
  var nav = document.getElementById('header-nav');
  var overlay = document.getElementById('header-overlay');

  function openMenu() {
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Close menu when a nav link is tapped
  nav.querySelectorAll('.header-nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on CTA button click inside nav
  nav.querySelectorAll('.header-nav-cta .btn').forEach(function (btn) {
    btn.addEventListener('click', closeMenu);
  });
})();
