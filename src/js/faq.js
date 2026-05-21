// ============================================================
// Section 8: FAQ Accordion
// ============================================================
(function () {
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var card = q.closest('.faq-card');
      card.classList.toggle('is-open');
    });
  });
})();
