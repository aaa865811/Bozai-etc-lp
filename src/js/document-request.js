/**
 * 資料請求モーダル制御（2ステップ・生年月日・ローディング対応）
 */
(function () {
  const modal = document.getElementById('document-request-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');
  const form = document.getElementById('document-request-form');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  const loadingOverlay = document.getElementById('form-loading-overlay');

  const step1 = form.querySelector('.form-step[data-step="1"]');
  const step2 = form.querySelector('.form-step[data-step="2"]');
  const stepIndicators = form.querySelectorAll('.step-item');
  const stepsIndicator = form.querySelector('.form-steps-indicator');
  const nextBtn = form.querySelector('.form-next');
  const prevBtn = form.querySelector('.form-prev');

  // --- 生年月日プルダウン生成 ---
  const yearSelect = document.getElementById('birth_year');
  const monthSelect = document.getElementById('birth_month');
  const daySelect = document.getElementById('birth_day');

  for (let y = 2010; y >= 1950; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  }
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
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
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }

  document.querySelectorAll('.document-request-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // --- ステップ切り替え ---
  nextBtn.addEventListener('click', () => {
    const nameVal = form.querySelector('input[name="name"]').value.trim();
    const emailVal = form.querySelector('input[name="email"]').value.trim();

    if (!nameVal) {
      alert('お名前を入力してください');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      alert('正しいメールアドレスを入力してください');
      return;
    }

    step1.style.display = 'none';
    step2.style.display = 'block';
    stepIndicators[0].classList.remove('active');
    stepIndicators[0].classList.add('completed');
    stepIndicators[1].classList.add('active');
  });

  prevBtn.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = 'block';
    stepIndicators[1].classList.remove('active');
    stepIndicators[0].classList.remove('completed');
    stepIndicators[0].classList.add('active');
  });

  // --- 生年月日バリデーション ---
  function isValidDate(y, m, d) {
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  // --- フォーム送信 ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const birthYear = parseInt(yearSelect.value, 10);
    const birthMonth = parseInt(monthSelect.value, 10);
    const birthDay = parseInt(daySelect.value, 10);

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

    const data = {
      name: form.querySelector('input[name="name"]').value.trim(),
      email: form.querySelector('input[name="email"]').value.trim(),
      birth_year: birthYear,
      birth_month: birthMonth,
      birth_day: birthDay,
      reasons: Array.from(form.querySelectorAll('input[name="reasons"]:checked')).map(cb => cb.value),
      consent: form.querySelector('input[name="consent"]').checked
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        step1.style.display = 'none';
        step2.style.display = 'none';
        stepsIndicator.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        errorMsg.querySelector('p').textContent = result.error || '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
        errorMsg.style.display = 'block';
      }
    } catch {
      errorMsg.querySelector('p').textContent = '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
      errorMsg.style.display = 'block';
    } finally {
      setTimeout(() => { loadingOverlay.style.display = 'none'; }, 1000);
    }
  });
})();
