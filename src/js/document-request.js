/**
 * 資料請求モーダル制御
 */
(function () {
  const modal = document.getElementById('document-request-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');
  const form = document.getElementById('document-request-form');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  const submitBtn = form.querySelector('.form-submit');

  // --- モーダル開閉 ---
  function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }

  // トリガーボタン
  document.querySelectorAll('.document-request-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // 閉じる
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // --- フォーム送信 ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    errorMsg.style.display = 'none';

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      age_group: form.age_group.value,
      reasons: Array.from(form.querySelectorAll('input[name="reasons"]:checked')).map(cb => cb.value),
      consent: form.consent.checked
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        errorMsg.textContent = result.error || '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    } catch {
      errorMsg.textContent = '送信に失敗しました。お電話（0120-979-919）でもお問い合わせいただけます。';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  });
})();
