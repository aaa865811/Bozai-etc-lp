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

// ============================================================
// Section 5: Voices - カルーセル＋タブ切替
// ============================================================
(function () {
  var DATA_URL = 'data/testimonials.json';

  function getInitials(name) {
    return name.replace(/\s|様|・/g, '').slice(0, 2).toUpperCase();
  }

  function buildAttr(t) {
    var parts = [];
    if (t.age_group) parts.push(t.age_group);
    else if (t.age) parts.push(t.age + '歳');
    if (t.occupation) parts.push(t.occupation);
    return parts.join(' / ');
  }

  function createVideoCard(t) {
    var thumb = t.youtube_thumbnail || '';
    var url = t.video_url || '#';
    return '<div class="voices-card voices-card-video">' +
      '<div class="voices-card-thumb">' +
        '<img src="' + thumb + '" alt="' + t.name + ' 様の合格体験記" loading="lazy">' +
        '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="voices-play-btn" aria-label="動画を再生">▶</a>' +
      '</div>' +
      '<div class="voices-card-info">' +
        '<p class="voices-card-name">' + t.name + ' 様</p>' +
        (t.subjects.length ? '<div class="voices-card-badges">' + t.subjects.map(function(s){ return '<span class="voices-card-badge">' + s + '</span>'; }).join('') + '</div>' : '') +
        '<p class="voices-card-attr">' + buildAttr(t) + '</p>' +
        '<p class="voices-card-comment">' + t.comment_short + '</p>' +
      '</div>' +
    '</div>';
  }

  function createTextCard(t) {
    return '<div class="voices-card voices-card-text">' +
      '<div class="voices-card-avatar">' + getInitials(t.name) + '</div>' +
      '<div class="voices-card-info">' +
        '<p class="voices-card-name">' + t.name + ' 様</p>' +
        (t.subjects.length ? '<div class="voices-card-badges">' + t.subjects.map(function(s){ return '<span class="voices-card-badge">' + s + '</span>'; }).join('') + '</div>' : '') +
        '<p class="voices-card-attr">' + buildAttr(t) + '</p>' +
        '<p class="voices-card-comment">' + t.comment_short + '</p>' +
      '</div>' +
      (t.comment_full ? '<a href="javascript:void(0)" class="voices-card-more">続きを読む →</a>' : '') +
    '</div>';
  }

  function createCard(t) {
    return t.type === 'video' ? createVideoCard(t) : createTextCard(t);
  }

  function buildCarousel(items, trackEl) {
    var html = items.map(createCard).join('');
    // 2倍にして無限スクロール
    trackEl.innerHTML = '<div class="voices-carousel-slide">' + html + html + '</div>';
  }

  function renderTabs(data) {
    var tabs = document.getElementById('voices-tabs');
    var content = document.getElementById('voices-tab-content');
    if (!tabs || !content) return;

    function showRound(roundNum) {
      var round = data.rounds.find(function(r) { return r.round === roundNum; });
      if (!round || !round.testimonials.length) {
        content.innerHTML = '<p class="voices-tab-empty">データ準備中です。しばらくお待ちください。</p>';
        return;
      }
      content.innerHTML = round.testimonials.slice(0, 6).map(createCard).join('');
    }

    tabs.addEventListener('click', function(e) {
      var btn = e.target.closest('.voices-tab');
      if (!btn) return;
      tabs.querySelectorAll('.voices-tab').forEach(function(t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      showRound(parseInt(btn.dataset.round, 10));
    });

    showRound(73);
  }

  // Fetch data and init
  fetch(DATA_URL)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var round73 = data.rounds.find(function(r) { return r.round === 73; });
      if (!round73) return;
      var items = round73.testimonials;

      // カルーセル：上段（前半）、下段（後半）
      var half = Math.ceil(items.length / 2);
      var upper = document.getElementById('carousel-upper');
      var lower = document.getElementById('carousel-lower');
      if (upper) buildCarousel(items.slice(0, half), upper);
      if (lower) buildCarousel(items.slice(half), lower);

      // タブ
      renderTabs(data);
    })
    .catch(function(err) {
      console.warn('体験記データの読み込みに失敗:', err);
    });
})();
