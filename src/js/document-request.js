/**
 * 資料請求モーダル制御（2ステップ・生年月日・ローディング対応）
 */
(function () {
  var modal = document.getElementById('document-request-modal');
  if (!modal) return;

  var overlay = modal.querySelector('.modal-overlay');
  var closeBtn = modal.querySelector('.modal-close');
  var form = document.getElementById('document-request-form');
  var successMsg = document.getElementById('form-success');
  var errorMsg = document.getElementById('form-error');
  var loadingOverlay = document.getElementById('form-loading-overlay');

  var step1 = form.querySelector('.form-step[data-step="1"]');
  var step2 = form.querySelector('.form-step[data-step="2"]');
  var stepIndicators = form.querySelectorAll('.step-item');
  var stepsIndicator = form.querySelector('.form-steps-indicator');
  var nextBtn = form.querySelector('.form-next');
  var prevBtn = form.querySelector('.form-prev');

  // --- 生年月日プルダウン生成 ---
  var yearSelect = document.getElementById('birth_year');
  var monthSelect = document.getElementById('birth_month');
  var daySelect = document.getElementById('birth_day');

  var y, m, d, opt;
  for (y = 2010; y >= 1950; y--) {
    opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  for (m = 1; m <= 12; m++) {
    opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  }
  for (d = 1; d <= 31; d++) {
    opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  }

  // --- モーダルリセット ---
  function resetModal() {
    form.reset();
    form.style.display = '';
    step1.style.display = '';
    step2.style.display = 'none';
    stepsIndicator.style.display = '';
    stepIndicators[0].classList.add('active');
    stepIndicators[0].classList.remove('completed');
    stepIndicators[1].classList.remove('active');
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
  }

  // --- モーダル開閉 ---
  function openModal() {
    resetModal();
    modal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    // Force reflow before adding is-open for transition
    modal.offsetHeight;
    modal.classList.add('is-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function() {
      modal.classList.remove('is-visible');
    }, 300);
  }

  // トリガーボタン（動的に追加されるボタンにも対応）
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('.document-request-trigger');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  // 閉じる
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) closeModal();
  });

  // --- ステップ切り替え ---
  nextBtn.addEventListener('click', function() {
    var nameVal = form.querySelector('input[name="name"]').value.trim();
    var emailVal = form.querySelector('input[name="email"]').value.trim();

    if (!nameVal) {
      alert('お名前を入力してください');
      return;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      alert('正しいメールアドレスを入力してください');
      return;
    }

    step1.style.display = 'none';
    step2.style.display = 'block';
    stepIndicators[0].classList.remove('active');
    stepIndicators[0].classList.add('completed');
    stepIndicators[1].classList.add('active');
    // モーダルの上部にスクロール
    modal.querySelector('.modal-content').scrollTop = 0;
  });

  prevBtn.addEventListener('click', function() {
    step2.style.display = 'none';
    step1.style.display = 'block';
    stepIndicators[1].classList.remove('active');
    stepIndicators[0].classList.remove('completed');
    stepIndicators[0].classList.add('active');
  });

  // --- 生年月日バリデーション ---
  function isValidDate(y, m, d) {
    var date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  // --- フォーム送信 ---
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var birthYear = parseInt(yearSelect.value, 10);
    var birthMonth = parseInt(monthSelect.value, 10);
    var birthDay = parseInt(daySelect.value, 10);

    if (!birthYear || !birthMonth || !birthDay) {
      alert('生年月日を選択してください');
      return;
    }
    if (!isValidDate(birthYear, birthMonth, birthDay)) {
      alert('正しい日付を選択してください');
      return;
    }

    // ローディング表示
    loadingOverlay.style.display = 'flex';

    var data = {
      name: form.querySelector('input[name="name"]').value.trim(),
      email: form.querySelector('input[name="email"]').value.trim(),
      birth_year: birthYear,
      birth_month: birthMonth,
      birth_day: birthDay,
      reasons: Array.from(form.querySelectorAll('input[name="reasons"]:checked')).map(function(cb) { return cb.value; }),
      consent: form.querySelector('input[name="consent"]').checked
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
      if (result.success) {
        step1.style.display = 'none';
        step2.style.display = 'none';
        stepsIndicator.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        errorMsg.querySelector('p').textContent = result.error || '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
        errorMsg.style.display = 'block';
      }
    })
    .catch(function() {
      errorMsg.querySelector('p').textContent = '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
      errorMsg.style.display = 'block';
    })
    .finally(function() {
      setTimeout(function() { loadingOverlay.style.display = 'none'; }, 1000);
    });
  });
})();
