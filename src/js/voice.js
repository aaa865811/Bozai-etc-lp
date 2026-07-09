// ============================================================
// Section 5: Voice - 官報合格者 + カルーセル + タブ切替 + モーダル
// ============================================================
(function () {
  var DATA_URL = '/data/testimonials.json';

  // --- Helpers ---
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function initials(name) {
    var clean = name.replace(/\s+/g, ' ').replace(/様/g, '').trim();
    if (/^[A-Za-z]/.test(clean)) return clean.replace(/[^A-Z]/gi, '').slice(0, 2).toUpperCase();
    return clean.slice(0, 2);
  }

  function attr(t) {
    var p = [];
    if (t.age_group) p.push(t.age_group);
    else if (t.age) p.push(t.age + '歳');
    if (t.occupation) p.push(t.occupation);
    return p.join(' / ');
  }

  function badges(subjects) {
    if (!subjects || !subjects.length) return '';
    return '<div class="voice-card-badges">' +
      subjects.map(function (s) { return '<span class="voice-card-badge">' + esc(s) + '</span>'; }).join('') +
      '</div>';
  }

  // --- Card builders ---
  function videoCard(t) {
    return '<div class="voice-card voice-card--video" data-url="' + esc(t.video_url || '') + '">' +
      '<div class="voice-card-thumb">' +
        '<img src="' + esc(t.youtube_thumbnail || '') + '" alt="' + esc(t.name) + ' 様" loading="lazy">' +
        '<span class="voice-play" aria-hidden="true">▶</span>' +
      '</div>' +
      '<div class="voice-card-info">' +
        '<p class="voice-card-name">' + esc(t.name) + ' <small>様</small></p>' +
        badges(t.subjects) +
        '<p class="voice-card-attr">' + esc(attr(t)) + '</p>' +
      '</div>' +
    '</div>';
  }

  function textCard(t) {
    return '<div class="voice-card voice-card--text"' +
      (t.comment_full ? ' data-modal="' + esc(t.id) + '"' : '') + '>' +
      '<div class="voice-card-ribbon">合格者の声</div>' +
      '<div class="voice-card-avatar">' +
        '<span class="voice-card-avatar-circle">' + esc(initials(t.name)) + '</span>' +
        '<span class="voice-card-avatar-name">' + esc(t.name) + '</span>' +
      '</div>' +
      '<div class="voice-card-info">' +
        '<p class="voice-card-name">' + esc(t.name) + ' <small>様</small></p>' +
        badges(t.subjects) +
        '<p class="voice-card-attr">' + esc(attr(t)) + '</p>' +
        '<p class="voice-card-comment">' + esc(t.comment_short) + '</p>' +
        (t.comment_full ? '<span class="voice-card-more">続きを読む →</span>' : '') +
      '</div>' +
    '</div>';
  }

  function card(t) { return t.type === 'video' ? videoCard(t) : textCard(t); }

  // --- Kanpou ---
  function renderKanpou(k) {
    var el = document.getElementById('voice-kanpou');
    if (!el || !k) return;
    el.innerHTML =
      '<div class="voice-kanpou">' +
        '<p class="voice-kanpou-label"><span aria-hidden="true">👑</span> 官報合格</p>' +
        '<p class="voice-kanpou-sublabel">5科目すべてに合格した、ネットスクール出身者</p>' +
        '<div class="voice-kanpou-card">' +
          '<div class="voice-kanpou-thumb">' +
            '<img src="' + esc(k.youtube_thumbnail) + '" alt="' + esc(k.name) + ' 様の合格体験記" loading="lazy">' +
            '<a href="' + esc(k.video_url) + '" target="_blank" rel="noopener noreferrer" class="voice-play voice-play--lg" aria-label="動画を再生">▶</a>' +
          '</div>' +
          '<div class="voice-kanpou-body">' +
            '<span class="voice-kanpou-badge">官報合格</span>' +
            '<p class="voice-kanpou-name">' + esc(k.name) + ' <span>様</span></p>' +
            '<p class="voice-kanpou-desc">' + esc(k.description) + '</p>' +
            '<div class="voice-kanpou-subjects">' +
              k.subjects.map(function (s) { return '<span class="voice-subject-tag">' + esc(s) + '</span>'; }).join('') +
            '</div>' +
            '<blockquote class="voice-kanpou-quote">「' + esc(k.comment_short) + '」</blockquote>' +
            '<a href="' + esc(k.video_url) + '" target="_blank" rel="noopener noreferrer" class="voice-kanpou-btn">▶ 動画体験記を見る</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // --- Carousel ---
  function renderCarousel(items) {
    var videos = items.filter(function (t) { return t.type === 'video'; });
    var texts  = items.filter(function (t) { return t.type === 'text'; });
    var upper  = videos.concat(texts.slice(0, 4));
    var lower  = texts.slice(4);

    function fill(el, list, speed) {
      if (!el || !list.length) return;
      var html = list.map(card).join('');
      el.innerHTML = '<div class="voice-carousel-slide" style="animation-duration:' + speed + 's">' + html + html + '</div>';
    }

    fill(document.getElementById('carousel-upper'), upper, 40);
    fill(document.getElementById('carousel-lower'), lower, 45);
  }

  // --- Tabs ---
  function renderTabs(rounds) {
    var tabsEl = document.getElementById('voice-tabs');
    var contentEl = document.getElementById('voice-tab-content');
    if (!tabsEl || !contentEl) return;

    // Build tab buttons
    tabsEl.innerHTML = rounds.map(function (r, i) {
      var soon = r.status === 'data_coming_soon';
      return '<button class="voice-tab' + (i === 0 ? ' is-active' : '') + (soon ? ' is-disabled' : '') + '"' +
        ' data-round="' + r.round + '" role="tab" aria-selected="' + (i === 0) + '"' +
        (soon ? ' disabled' : '') + '>' +
        '第' + r.round + '回' + (soon ? ' <span class="voice-tab-soon">準備中</span>' : '') +
      '</button>';
    }).join('');

    function showRound(num) {
      var r = rounds.find(function (r) { return r.round === num; });
      if (!r || !r.testimonials || !r.testimonials.length) {
        contentEl.innerHTML = '<p class="voice-tab-empty">現在準備中です。しばらくお待ちください。</p>';
        return;
      }
      contentEl.innerHTML = r.testimonials.slice(0, 6).map(card).join('');
    }

    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.voice-tab');
      if (!btn || btn.disabled) return;
      tabsEl.querySelectorAll('.voice-tab').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      showRound(parseInt(btn.dataset.round, 10));
    });

    showRound(73);
  }

  // --- Modal ---
  function initModal(allItems) {
    var modal   = document.getElementById('voice-modal');
    var overlay = document.getElementById('voice-modal-overlay');
    var closeBtn = document.getElementById('voice-modal-close');
    var body    = document.getElementById('voice-modal-body');
    if (!modal) return;

    function open(id) {
      var t = allItems.find(function (i) { return i.id === id; });
      if (!t || !t.comment_full) return;
      body.innerHTML =
        '<p class="voice-modal-name">' + esc(t.name) + ' 様</p>' +
        badges(t.subjects) +
        '<p class="voice-modal-attr">' + esc(attr(t)) +
          (t.course ? '　' + esc(t.course) : '') + '</p>' +
        '<hr class="voice-modal-hr">' +
        '<p class="voice-modal-text">' + esc(t.comment_full) + '</p>';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // Delegate click on cards
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-modal]');
      if (c) { open(c.dataset.modal); return; }
      var v = e.target.closest('[data-url]');
      if (v && v.dataset.url) { window.open(v.dataset.url, '_blank', 'noopener'); }
    });
  }

  // --- Init ---
  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderKanpou(data.kanpou);

      var r73 = data.rounds.find(function (r) { return r.round === 73; });
      if (r73 && r73.testimonials) {
        renderCarousel(r73.testimonials);
        initModal(r73.testimonials);
      }

      renderTabs(data.rounds);
    })
    .catch(function (err) { console.warn('体験記データ読み込み失敗:', err); });
})();
