const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
  nav.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const goal = Number(el.dataset.count);
    const decimals = String(goal).includes('.') ? 1 : 0;
    const start = performance.now();
    const duration = 1100;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (goal * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: .7 });

document.querySelectorAll('.metric-number').forEach(el => countObserver.observe(el));

const growthChart = document.querySelector('.growth-chart');
if (growthChart) {
  const growthObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const chart = entry.target;
      chart.classList.add('is-animated');
      const count = chart.querySelector('[data-growth-count]');
      const target = Number(count.dataset.growthCount);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const start = performance.now();
      const duration = reducedMotion ? 0 : 1800;
      const animateCount = now => {
        const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        count.textContent = Math.round(target * eased).toLocaleString('ja-JP');
        if (progress < 1) requestAnimationFrame(animateCount);
      };
      requestAnimationFrame(animateCount);
      growthObserver.unobserve(chart);
    });
  }, { threshold: .4 });
  growthObserver.observe(growthChart);
}

const resultDialog = document.querySelector('#result-dialog');
const resultData = {
  tiktok: {
    title: 'TikTokアカウント運用',
    number: '約2週間でフォロワー 2.1万人',
    description: '運用開始から約2週間で、2.1万人がフォローするTikTokアカウントへ。短期間でも闇雲に投稿せず、企画・見せ方・投稿検証を組み合わせ、認知の入口として機能する運用を行いました。'
  },
  sales: {
    title: '営業代行',
    number: '年間取扱実績 7億円',
    description: 'エネルギー業界におけるTo C営業を中心に、年間7億円の取扱実績。生活者に届く提案設計と実行力を強みに、アプローチから商談・成約につながる出口まで代行します。'
  }
};

document.querySelectorAll('.metric-card').forEach(card => {
  card.addEventListener('click', () => {
    const result = resultData[card.dataset.result];
    document.querySelector('#result-title').textContent = result.title;
    document.querySelector('#result-number').textContent = result.number;
    document.querySelector('#result-description').textContent = result.description;
    resultDialog.showModal();
  });
});

resultDialog?.querySelector('.result-dialog__close').addEventListener('click', () => resultDialog.close());
resultDialog?.addEventListener('click', event => {
  if (event.target === resultDialog) resultDialog.close();
});
resultDialog?.querySelector('a').addEventListener('click', () => resultDialog.close());

const inquiryForm = document.querySelector('#inquiry-form');
const dateField = document.querySelector('#form-date');
const confirmDialog = document.querySelector('#form-confirm');

if (dateField) {
  const minimum = new Date(Date.now() + 24 * 60 * 60 * 1000);
  minimum.setMinutes(Math.ceil(minimum.getMinutes() / 30) * 30, 0, 0);
  const local = new Date(minimum.getTime() - minimum.getTimezoneOffset() * 60000);
  dateField.min = local.toISOString().slice(0, 16);
}

const setFieldState = field => {
  const wrapper = field.closest('.form-field') || field.closest('.form-consent')?.parentElement;
  wrapper?.classList.toggle('has-error', !field.validity.valid);
  return field.validity.valid;
};

inquiryForm?.querySelectorAll('input:not([type="checkbox"]), textarea').forEach(field => {
  field.addEventListener('blur', () => setFieldState(field));
  field.addEventListener('input', () => {
    if (field.closest('.has-error')) setFieldState(field);
  });
});

inquiryForm?.addEventListener('submit', event => {
  event.preventDefault();
  const status = inquiryForm.querySelector('.form-status');
  const services = [...inquiryForm.querySelectorAll('input[name="相談したいサービス"]')];
  const serviceGroup = inquiryForm.querySelector('.form-services');
  const consent = inquiryForm.querySelector('input[name="プライバシーポリシーへの同意"]');
  let valid = true;

  inquiryForm.querySelectorAll('input[required]:not([type="checkbox"]), textarea[required]').forEach(field => {
    if (!setFieldState(field)) valid = false;
  });
  const serviceValid = services.some(field => field.checked);
  serviceGroup.classList.toggle('has-error', !serviceValid);
  if (!serviceValid) valid = false;
  inquiryForm.querySelector('.form-consent-error').classList.toggle('is-visible', !consent.checked);
  if (!consent.checked) valid = false;

  if (!valid) {
    status.textContent = '未入力または入力内容に誤りがある項目をご確認ください。';
    status.className = 'form-status is-error';
    inquiryForm.querySelector('.has-error, .form-consent-error.is-visible')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const values = new FormData(inquiryForm);
  const rows = [
    ['お名前', values.get('お名前')],
    ['法人名・店舗名・屋号', values.get('法人名・店舗名・屋号')],
    ['メールアドレス', values.get('メールアドレス')],
    ['電話番号', values.get('電話番号')],
    ['相談したいサービス', values.getAll('相談したいサービス').join('、')],
    ['希望日時', String(values.get('希望日時')).replace('T', ' ')],
    ['現在の課題・相談内容', values.get('現在の課題・相談内容')]
  ];
  const summary = confirmDialog.querySelector('#form-confirm-summary');
  summary.replaceChildren(...rows.map(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    return row;
  }));
  confirmDialog.showModal();
});

const sendInquiryForm = async () => {
  const status = inquiryForm.querySelector('.form-status');
  const submit = inquiryForm.querySelector('.form-submit');
  const confirmSend = confirmDialog.querySelector('.form-confirm__send');

  submit.disabled = true;
  confirmSend.disabled = true;
  submit.classList.add('is-loading');
  submit.querySelector('.form-submit__label').textContent = '送信しています…';
  confirmSend.firstChild.textContent = '送信しています… ';
  status.textContent = '';

  try {
    const sheetEndpoint = window.ENCIAL_CONFIG?.spreadsheetWebhookUrl;
    const formData = new FormData(inquiryForm);
    const response = await fetch('https://formsubmit.co/ajax/info-encial@inc.com', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    });
    if (!response.ok) throw new Error('メール送信に失敗しました');

    if (sheetEndpoint) {
      const preferredDate = String(formData.get('希望日時') || '');
      const payload = {
        type: 'liff_submit',
        userId: '',
        displayName: '',
        name: String(formData.get('お名前') || ''),
        company: String(formData.get('法人名・店舗名・屋号') || ''),
        gyotai: 'LPからのお問い合わせ',
        tel: String(formData.get('電話番号') || ''),
        email: String(formData.get('メールアドレス') || ''),
        services: formData.getAll('相談したいサービス'),
        issue: String(formData.get('現在の課題・相談内容') || ''),
        budget: '未定・相談したい',
        contactMethod: 'メールまたは電話',
        contactTime: '',
        website: '',
        sns: '',
        meetingDate: preferredDate.slice(0, 10),
        meetingTime: preferredDate.slice(11, 16)
      };
      await fetch(sheetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(error => console.error('Spreadsheet sync failed:', error));
    }
    inquiryForm.reset();
    confirmDialog.close();
    status.textContent = 'お問い合わせを送信しました。担当者より2営業日以内にご連絡します。';
    status.className = 'form-status is-success';
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    confirmDialog.close();
    status.innerHTML = '送信できませんでした。お手数ですが <a href="mailto:info-encial@inc.com">info-encial@inc.com</a> へ直接ご連絡ください。';
    status.className = 'form-status is-error';
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submit.disabled = false;
    confirmSend.disabled = false;
    submit.classList.remove('is-loading');
    submit.querySelector('.form-submit__label').textContent = '入力内容を送信する';
    confirmSend.firstChild.textContent = 'この内容で送信する ';
  }
};

confirmDialog?.querySelector('.form-confirm__back').addEventListener('click', () => confirmDialog.close());
confirmDialog?.querySelector('.form-confirm__send').addEventListener('click', sendInquiryForm);

inquiryForm?.querySelectorAll('input[name="相談したいサービス"]').forEach(field => {
  field.addEventListener('change', () => inquiryForm.querySelector('.form-services').classList.remove('has-error'));
});
