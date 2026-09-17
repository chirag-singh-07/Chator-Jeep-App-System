/* ══════════════════════════════════════════════
   CHATORI JEEB RESTAURANT — PARTNER APP JS
   ══════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   SCREEN ROUTING
──────────────────────────────────────────── */
let currentScreen = 'screen-onboarding';

function switchScreen(to, from = currentScreen) {
  const toEl = document.getElementById(to);
  const fromEl = from ? document.getElementById(from) : null;

  if (!toEl) return;

  if (fromEl && fromEl !== toEl) {
    fromEl.classList.add('exit');
    setTimeout(() => {
      fromEl.classList.remove('active', 'exit');
      fromEl.style.display = '';
    }, 280);
  }

  toEl.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toEl.classList.add('active');
    });
  });

  currentScreen = to;
}

/* ────────────────────────────────────────────
   TOAST SYSTEM
──────────────────────────────────────────── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };

  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3100);
}

/* ────────────────────────────────────────────
   FORM VALIDATION HELPERS
──────────────────────────────────────────── */
function setError(fieldId, errId, message) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.add('error');
  if (err) err.textContent = message;
  return false;
}

function clearError(fieldId, errId) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.remove('error');
  if (err) err.textContent = '';
}

function clearAllErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-err').forEach(el => el.textContent = '');
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validatePhone(v) {
  return /^[6-9]\d{9}$/.test(v);
}

/* ────────────────────────────────────────────
   MULTI-STEP ONBOARDING CAROUSEL
──────────────────────────────────────────── */
(function initOnboarding() {
  const TOTAL_SLIDES = 4;
  let currentSlide = 0;
  let startX = 0;
  let isDragging = false;

  const track     = document.getElementById('ob-track');
  const dots      = document.querySelectorAll('.ob-dot');
  const nextBtn   = document.getElementById('ob-next');
  const nextLabel = document.getElementById('ob-next-label');
  const nextIcon  = document.getElementById('ob-next-icon');
  const skipBtn   = document.getElementById('ob-skip');

  function goToSlide(idx) {
    currentSlide = Math.max(0, Math.min(TOTAL_SLIDES - 1, idx));
    track.style.transform = `translateX(-${currentSlide * 25}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    const isLast = currentSlide === TOTAL_SLIDES - 1;
    nextLabel.textContent = isLast ? 'Get Started' : 'Next';
    nextBtn.classList.toggle('last-slide', isLast);
    nextIcon.className = isLast ? 'fa-solid fa-store' : 'fa-solid fa-arrow-right';
    skipBtn.style.visibility = isLast ? 'hidden' : 'visible';
  }

  nextBtn.addEventListener('click', () => {
    if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1);
    else switchScreen('screen-welcome');
  });

  skipBtn.addEventListener('click', () => switchScreen('screen-welcome'));

  dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

  const viewport = document.getElementById('ob-viewport');

  viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (!isDragging) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
    isDragging = false;
  }, { passive: true });

  viewport.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  viewport.addEventListener('mouseup', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
    isDragging = false;
  });

  goToSlide(0);
})();

/* ────────────────────────────────────────────
   WELCOME SCREEN
──────────────────────────────────────────── */
document.getElementById('btn-go-login').addEventListener('click', () => switchScreen('screen-login'));
document.getElementById('btn-go-register').addEventListener('click', () => switchScreen('screen-reg1'));

/* ────────────────────────────────────────────
   BACK BUTTONS
──────────────────────────────────────────── */
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => switchScreen(btn.dataset.target));
});

document.querySelectorAll('.btn-ghost[data-target]').forEach(btn => {
  btn.addEventListener('click', () => switchScreen(btn.dataset.target));
});

/* ────────────────────────────────────────────
   LOGIN / REGISTER LINKS
──────────────────────────────────────────── */
document.getElementById('link-reg1-login').addEventListener('click', e => {
  e.preventDefault();
  switchScreen('screen-login');
});

document.getElementById('link-login-register').addEventListener('click', e => {
  e.preventDefault();
  switchScreen('screen-reg1');
});

document.getElementById('btn-submitted-login').addEventListener('click', () => {
  switchScreen('screen-login');
});

/* ────────────────────────────────────────────
   REG STEP 1 FORM
──────────────────────────────────────────── */
document.getElementById('form-reg1').addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;
  clearAllErrors(e.target);

  const name = document.getElementById('r1-name').value.trim();
  const owner = document.getElementById('r1-owner').value.trim();
  const mobile = document.getElementById('r1-mobile').value.trim();
  const email = document.getElementById('r1-email').value.trim();
  const address = document.getElementById('r1-address').value.trim();
  const cuisine = document.getElementById('r1-cuisine').value;

  if (!name || name.length < 3) valid = setError('r1-name', 'err-r1-name', 'Restaurant name must be at least 3 characters.');
  if (!owner || owner.length < 2) valid = setError('r1-owner', 'err-r1-owner', 'Please enter the owner name.');
  if (!validatePhone(mobile)) valid = setError('r1-mobile', 'err-r1-mobile', 'Enter a valid 10-digit mobile number.');
  if (!validateEmail(email)) valid = setError('r1-email', 'err-r1-email', 'Enter a valid email address.');
  if (!address || address.length < 10) valid = setError('r1-address', 'err-r1-address', 'Please enter a complete address.');
  if (!cuisine) valid = setError('r1-cuisine', 'err-r1-cuisine', 'Please select a cuisine type.');

  if (valid) {
    showToast('Looking good! Let\'s add business details.', 'success');
    setTimeout(() => switchScreen('screen-reg2'), 400);
  } else {
    showToast('Please fix the highlighted errors.', 'error');
    e.target.querySelector('.field-err:not(:empty)').closest('.field-group')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

/* ────────────────────────────────────────────
   REG STEP 2 FORM
──────────────────────────────────────────── */
const uploadedFiles = {};

document.querySelectorAll('.upload-box').forEach(box => {
  const input = box.querySelector('.upload-input');
  const field = box.dataset.field;
  const inner = box.querySelector('.upload-inner');

  input.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const maxMB = field === 'cover' ? 5 : 2;
    if (file.size > maxMB * 1024 * 1024) {
      showToast(`File too large. Max ${maxMB}MB allowed.`, 'error');
      return;
    }

    uploadedFiles[field] = file;
    box.classList.add('uploaded');
    inner.querySelector('.upload-text').textContent = `✓ ${file.name.length > 22 ? file.name.substring(0, 22) + '...' : file.name}`;
    inner.querySelector('.upload-icon-wrap i').className = 'fa-solid fa-circle-check';
    inner.querySelector('.upload-hint').textContent = `${(file.size / 1024).toFixed(0)} KB`;
    showToast(`${file.name.split('.')[0]} uploaded.`, 'success');
  });
});

document.getElementById('form-reg2').addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;
  clearAllErrors(e.target);

  const fssai = document.getElementById('r2-fssai').value.trim();
  const openTime = document.getElementById('r2-open').value;
  const closeTime = document.getElementById('r2-close').value;
  const prep = document.getElementById('r2-prep').value;

  if (!fssai || fssai.length !== 14 || !/^\d+$/.test(fssai)) {
    valid = setError('r2-fssai', 'err-r2-fssai', 'Enter a valid 14-digit FSSAI license number.');
  }
  if (!openTime) valid = setError('r2-open', 'err-r2-open', 'Select opening time.');
  if (!closeTime) valid = setError('r2-close', 'err-r2-close', 'Select closing time.');
  if (openTime && closeTime && openTime >= closeTime) {
    valid = setError('r2-close', 'err-r2-close', 'Closing time must be after opening time.');
  }
  if (!prep) valid = setError('r2-prep', 'err-r2-prep', 'Select preparation time.');

  if (!uploadedFiles['logo']) {
    document.getElementById('err-upload-logo').textContent = 'Please upload your restaurant logo.';
    valid = false;
  }
  if (!uploadedFiles['cover']) {
    document.getElementById('err-upload-cover').textContent = 'Please upload a cover image.';
    valid = false;
  }

  if (valid) {
    showToast('Almost done! Final step.', 'success');
    setTimeout(() => switchScreen('screen-reg3'), 400);
  } else {
    showToast('Please fix the highlighted errors.', 'error');
  }
});

/* ────────────────────────────────────────────
   REG STEP 3 FORM
──────────────────────────────────────────── */
document.getElementById('form-reg3').addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;
  clearAllErrors(e.target);

  const accName = document.getElementById('r3-acc-name').value.trim();
  const bank = document.getElementById('r3-bank').value;
  const accNo = document.getElementById('r3-acc-no').value.trim();
  const ifsc = document.getElementById('r3-ifsc').value.trim();
  const terms = document.getElementById('r3-terms').checked;

  if (!accName || accName.length < 3) valid = setError('r3-acc-name', 'err-r3-acc-name', 'Enter account holder name.');
  if (!bank) valid = setError('r3-bank', 'err-r3-bank', 'Please select your bank.');
  if (!accNo || accNo.length < 9 || !/^\d+$/.test(accNo)) valid = setError('r3-acc-no', 'err-r3-acc-no', 'Enter a valid account number (9–18 digits).');
  if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) valid = setError('r3-ifsc', 'err-r3-ifsc', 'Enter a valid IFSC code (e.g. HDFC0001234).');

  if (!uploadedFiles['pan']) {
    document.getElementById('err-upload-pan').textContent = 'Please upload your PAN card.';
    valid = false;
  }
  if (!uploadedFiles['fssai']) {
    document.getElementById('err-upload-fssai-cert').textContent = 'Please upload FSSAI certificate.';
    valid = false;
  }

  if (!terms) {
    document.getElementById('err-r3-terms').textContent = 'You must agree to the terms to proceed.';
    valid = false;
  }

  if (valid) {
    const btn = e.target.querySelector('[type=submit]');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    setTimeout(() => {
      switchScreen('screen-submitted');
    }, 1800);
  } else {
    showToast('Please fix the highlighted errors.', 'error');
  }
});

/* ────────────────────────────────────────────
   LOGIN TABS
──────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.login-tab-content[data-tab="${tab}"]`).classList.add('active');
  });
});

/* ── Password Toggle ── */
document.querySelectorAll('.pass-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    btn.querySelector('i').className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });
});

/* ── Login Form ── */
document.getElementById('form-login').addEventListener('submit', e => {
  e.preventDefault();
  clearAllErrors(e.target);
  let valid = true;

  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value;

  if (!user) valid = setError('l-user', 'err-l-user', 'Enter your mobile number or email.');
  if (!pass || pass.length < 6) valid = setError('l-pass', 'err-l-pass', 'Password must be at least 6 characters.');

  if (valid) {
    const btn = e.target.querySelector('[type=submit]');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login to Dashboard';
      btn.disabled = false;
      showToast('Welcome back! Loading your dashboard…', 'success');
      setTimeout(() => {
        switchScreen('screen-dashboard');
        renderOrders();
      }, 600);
    }, 1500);
  } else {
    showToast('Please fix the errors above.', 'error');
  }
});

/* ── OTP Send ── */
let otpTimerInterval = null;

document.getElementById('btn-send-otp').addEventListener('click', () => {
  const mobile = document.getElementById('otp-mobile').value.trim();
  if (!validatePhone(mobile)) {
    setError('otp-mobile', 'err-otp-mobile', 'Enter a valid 10-digit mobile number.');
    return;
  }
  clearError('otp-mobile', 'err-otp-mobile');
  showToast(`OTP sent to +91 ${mobile}`, 'success');

  const wrap = document.getElementById('otp-field-wrap');
  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Start 30s countdown
  let timeLeft = 30;
  const timerEl = document.getElementById('otp-timer');
  clearInterval(otpTimerInterval);
  timerEl.textContent = '30s';

  otpTimerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft + 's';
    if (timeLeft <= 0) {
      clearInterval(otpTimerInterval);
      timerEl.textContent = 'Resend OTP';
      timerEl.style.cursor = 'pointer';
      timerEl.style.textDecoration = 'underline';
    }
  }, 1000);

  // Focus first OTP box
  setTimeout(() => {
    document.querySelector('.otp-box')?.focus();
  }, 100);
});

/* ── OTP Box Auto-Focus ── */
document.querySelectorAll('.otp-box').forEach((box, index, boxes) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/\D/, '');
    if (box.value && index < boxes.length - 1) {
      boxes[index + 1].focus();
    }
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !box.value && index > 0) {
      boxes[index - 1].focus();
    }
  });
});

/* ── OTP Verify ── */
document.getElementById('form-otp').addEventListener('submit', e => {
  e.preventDefault();
  const otp = [...document.querySelectorAll('.otp-box')].map(b => b.value).join('');
  if (otp.length < 6) {
    showToast('Enter the complete 6-digit OTP.', 'error');
    return;
  }

  const btn = e.target.querySelector('[type=submit]');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
  btn.disabled = true;

  setTimeout(() => {
    showToast('OTP verified! Welcome back.', 'success');
    setTimeout(() => {
      switchScreen('screen-dashboard');
      renderOrders();
    }, 600);
  }, 1500);
});

/* ────────────────────────────────────────────
   DASHBOARD — RESTAURANT TOGGLE
──────────────────────────────────────────── */
const toggle = document.getElementById('rest-toggle');
const statusLabel = document.getElementById('status-label');
let restOpen = true;

toggle.addEventListener('click', () => {
  restOpen = !restOpen;
  toggle.classList.toggle('off', !restOpen);
  statusLabel.textContent = restOpen ? 'OPEN' : 'CLOSED';
  statusLabel.classList.toggle('closed', !restOpen);
  showToast(
    restOpen ? 'Restaurant is now OPEN for orders!' : 'Restaurant marked as CLOSED.',
    restOpen ? 'success' : 'info'
  );
});

/* ────────────────────────────────────────────
   DASHBOARD — ORDERS DATA & RENDER
──────────────────────────────────────────── */
const ORDERS = [
  {
    id: 'CJ-4821',
    customer: 'Arjun Mehta',
    items: 'Butter Chicken (2) • Garlic Naan (4) • Raita (1)',
    amount: 640,
    status: 'new',
    time: '2 min ago',
    persons: 4,
  },
  {
    id: 'CJ-4820',
    customer: 'Priya Sharma',
    items: 'Paneer Tikka (1) • Dal Makhani (2) • Jeera Rice (2)',
    amount: 485,
    status: 'new',
    time: '5 min ago',
    persons: 2,
  },
  {
    id: 'CJ-4819',
    customer: 'Rohit Verma',
    items: 'Chicken Biryani (3) • Raita (2) • Gulab Jamun (4)',
    amount: 920,
    status: 'preparing',
    time: '12 min ago',
    persons: 3,
  },
  {
    id: 'CJ-4818',
    customer: 'Sneha Patel',
    items: 'Veg Thali (2) • Lassi (2)',
    amount: 380,
    status: 'preparing',
    time: '18 min ago',
    persons: 2,
  },
  {
    id: 'CJ-4817',
    customer: 'Vikram Singh',
    items: 'Mutton Rogan Josh (1) • Roomali Roti (4) • Kheer (2)',
    amount: 760,
    status: 'ready',
    time: '28 min ago',
    persons: 2,
  },
  {
    id: 'CJ-4816',
    customer: 'Kavita Joshi',
    items: 'Chole Bhature (2) • Masala Chai (2)',
    amount: 220,
    status: 'ready',
    time: '35 min ago',
    persons: 2,
  },
  {
    id: 'CJ-4815',
    customer: 'Amit Gupta',
    items: 'Chicken Tikka Masala (2) • Butter Naan (6)',
    amount: 540,
    status: 'new',
    time: '1 min ago',
    persons: 3,
  },
  {
    id: 'CJ-4814',
    customer: 'Deepa Nair',
    items: 'Fish Curry (1) • Appam (4) • Payasam (2)',
    amount: 480,
    status: 'new',
    time: '3 min ago',
    persons: 2,
  }
];

const statusConfig = {
  new: {
    badge: 'badge-new',
    label: 'New Order',
    cardClass: 'status-new',
    nextLabel: null,
  },
  preparing: {
    badge: 'badge-preparing',
    label: 'Preparing',
    cardClass: 'status-preparing',
    nextLabel: 'Mark Ready <i class="fa-solid fa-bag-shopping"></i>',
  },
  ready: {
    badge: 'badge-ready',
    label: 'Ready for Pickup',
    cardClass: 'status-ready',
    nextLabel: 'Mark Delivered <i class="fa-solid fa-check"></i>',
  },
  delivered: {
    badge: 'badge-delivered',
    label: 'Delivered',
    cardClass: 'status-delivered',
    nextLabel: null,
  },
};

function updateCounts() {
  const counts = { new: 0, preparing: 0, ready: 0, delivered: 0 };
  ORDERS.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
  document.getElementById('count-new').textContent = counts.new;
  document.getElementById('count-prep').textContent = counts.preparing;
  document.getElementById('count-ready').textContent = counts.ready;
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';

  ORDERS.forEach((order, idx) => {
    const cfg = statusConfig[order.status];
    const card = document.createElement('div');
    card.className = `order-card ${cfg.cardClass}`;
    card.id = `order-${order.id}`;

    let actionsHTML = '';

    if (order.status === 'new') {
      actionsHTML = `
        <div class="oc-actions">
          <button class="btn-accept" onclick="acceptOrder(${idx})">
            <i class="fa-solid fa-check"></i> Accept Order
          </button>
          <button class="btn-reject" onclick="rejectOrder(${idx})">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
        </div>`;
    } else if (order.status !== 'delivered') {
      actionsHTML = `
        <div class="oc-actions">
          <button class="btn-next-status" onclick="advanceOrder(${idx})">
            ${cfg.nextLabel}
          </button>
        </div>`;
    } else {
      actionsHTML = `<div class="oc-actions" style="justify-content:flex-end">
        <span style="font-size:12px;color:var(--green);font-weight:600"><i class="fa-solid fa-circle-check"></i> Delivered</span>
      </div>`;
    }

    card.innerHTML = `
      <div class="oc-top">
        <div class="oc-id-wrap">
          <span class="oc-id">#${order.id}</span>
          <span class="oc-customer">${order.customer}</span>
        </div>
        <span class="oc-time"><i class="fa-regular fa-clock"></i> ${order.time}</span>
      </div>
      <div class="oc-items">${order.items}</div>
      <div class="oc-bottom">
        <div>
          <div class="oc-amount">₹${order.amount.toLocaleString('en-IN')}</div>
          <div class="oc-amount-sub">${order.persons} items • Online pay</div>
        </div>
        <span class="status-badge ${cfg.badge}">${cfg.label}</span>
      </div>
      ${actionsHTML}
    `;

    // Animate card in
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    list.appendChild(card);

    setTimeout(() => {
      card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, idx * 80);
  });

  updateCounts();
}

function acceptOrder(idx) {
  ORDERS[idx].status = 'preparing';
  showToast(`Order #${ORDERS[idx].id} accepted! Kitchen notified.`, 'success');
  renderOrders();
}

function rejectOrder(idx) {
  if (confirm(`Reject order #${ORDERS[idx].id} from ${ORDERS[idx].customer}?`)) {
    ORDERS.splice(idx, 1);
    showToast('Order rejected. Customer has been notified.', 'info');
    renderOrders();
  }
}

function advanceOrder(idx) {
  const order = ORDERS[idx];
  const transitions = { preparing: 'ready', ready: 'delivered' };
  const messages = {
    ready: `Order #${order.id} is Ready for Pickup! Notifying driver.`,
    delivered: `Order #${order.id} marked as Delivered. Great work! 🎉`
  };

  const nextStatus = transitions[order.status];
  if (!nextStatus) return;

  order.status = nextStatus;
  showToast(messages[nextStatus], 'success');
  renderOrders();
}

/* ────────────────────────────────────────────
   BOTTOM NAV
──────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const nav = btn.dataset.nav;
    const navMessages = {
      orders: 'Showing all orders for today.',
      menu: 'Menu management coming soon!',
      earnings: 'Earnings module coming soon!',
      profile: 'Profile settings coming soon!'
    };
    if (nav !== 'home' && navMessages[nav]) {
      showToast(navMessages[nav], 'info');
    }
  });
});

/* ────────────────────────────────────────────
   INLINE FIELD VALIDATION
──────────────────────────────────────────── */
// Clear error on focus for each input
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('focus', () => {
    field.classList.remove('error');
    const errEl = document.getElementById('err-' + field.id);
    if (errEl) errEl.textContent = '';
  });
});

// IFSC auto-uppercase
document.getElementById('r3-ifsc')?.addEventListener('input', function () {
  this.value = this.value.toUpperCase();
});

// Account number — numbers only
document.getElementById('r3-acc-no')?.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

// FSSAI — numbers only
document.getElementById('r2-fssai')?.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

// Mobile numbers — numbers only
document.querySelectorAll('input[type="tel"]').forEach(inp => {
  inp.addEventListener('input', function () {
    if (!this.classList.contains('otp-box')) {
      this.value = this.value.replace(/\D/g, '');
    }
  });
});

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Onboarding shown by default (class="screen active" in HTML)
  console.log('%cChatori Jeeb Restaurant Partner App', 'color: #D71920; font-size: 16px; font-weight: 800;');
  console.log('%cUI Prototype — HTML/CSS/JS Only', 'color: #666; font-size: 12px;');
});
