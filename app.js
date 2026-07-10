/**
 * MODULE 1: User Interface & Router
 * SPA routing and all UI rendering functions.
 */

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Toast Notifications ──────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${escHtml(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3500);
}

/* ─── Modal (Delete Confirmation) ──────────────────────────────────────────── */
let _pendingDeleteId = null;
function showDeleteModal(id) {
  _pendingDeleteId = id;
  document.getElementById('delete-modal').classList.add('open');
}
function hideDeleteModal() {
  _pendingDeleteId = null;
  document.getElementById('delete-modal').classList.remove('open');
}

/* ─── Router ───────────────────────────────────────────────────────────────── */
const Router = {
  routes: {
    '#login':     renderLogin,
    '#dashboard': renderDashboard,
    '#customers': renderCustomers,
    '#add':       renderAddCustomer,
    '#edit':      renderEditCustomer,
    '#reports':   renderReports,
  },
  render() {
    const hash = window.location.hash || '#login';
    // Auth guard
    if (hash !== '#login' && !Auth.isLoggedIn()) {
      window.location.hash = '#login';
      return;
    }
    if (hash === '#login' && Auth.isLoggedIn()) {
      window.location.hash = '#dashboard';
      return;
    }
    const fn = this.routes[hash] || this.routes['#dashboard'];
    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');

    if (hash === '#login') {
      sidebar.style.display = 'none';
      app.className = 'app-full';
    } else {
      sidebar.style.display = '';
      app.className = 'app-main';
      updateSidebarActive(hash);
    }
    fn();
  }
};

function updateSidebarActive(hash) {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}

/* ─── LOGIN PAGE ───────────────────────────────────────────────────────────── */
function renderLogin() {
  document.getElementById('page-content').innerHTML = `
    <div class="login-wrap">
      <div class="login-bg-panel">
        <div class="login-brand-side">
          <div class="login-brand-logo">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="26" fill="url(#lg2)"/>
              <path d="M14 18h24M14 26h16M14 34h20" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
              <defs><linearGradient id="lg2" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6c63ff"/><stop offset="1" stop-color="#ff6584"/>
              </linearGradient></defs>
            </svg>
          </div>
          <h1 class="login-brand-name">ClientHub</h1>
          <p class="login-brand-tagline">Your all-in-one customer management platform</p>
          <ul class="login-features">
            <li>
              <span class="feat-icon">&#10003;</span>
              Manage & organize customer records
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Instant search and smart filters
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Analytics, reports & city insights
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Secure admin login & session control
            </li>
          </ul>
        </div>
      </div>
      <div class="login-card glass-card">
        <div class="login-logo">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="26" fill="url(#lg)"/>
              <path d="M14 18h24M14 26h16M14 34h20" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
              <defs><linearGradient id="lg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6c63ff"/><stop offset="1" stop-color="#ff6584"/>
              </linearGradient></defs>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your <strong style="color:var(--accent-light)">ClientHub</strong> account</p>
        </div>
        <form id="login-form" novalidate autocomplete="off">
          <div class="form-group">
            <label for="login-user">Username</label>
            <input id="login-user" type="text" placeholder="Enter your username" autocomplete="username" />
            <span class="field-error" id="err-login-user"></span>
          </div>
          <div class="form-group">
            <label for="login-pass">Password</label>
            <div class="input-eye-wrap">
              <input id="login-pass" type="password" placeholder="Enter your password" autocomplete="current-password" />
              <button type="button" class="eye-btn" onclick="togglePassword('login-pass', this)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <span class="field-error" id="err-login-pass"></span>
          </div>
          <div id="login-general-err" class="general-error" style="display:none;"></div>
          <button type="submit" class="btn btn-primary btn-full" id="login-btn">
            <span>Sign In to ClientHub</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <div class="login-hint">Default credentials: <strong>admin</strong> / <strong>admin123</strong></div>
        </form>
      </div>
    </div>`;

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    let ok = true;
    document.getElementById('err-login-user').textContent = '';
    document.getElementById('err-login-pass').textContent = '';
    document.getElementById('login-general-err').style.display = 'none';
    if (!u) { document.getElementById('err-login-user').textContent = 'Username required.'; ok = false; }
    if (!p) { document.getElementById('err-login-pass').textContent = 'Password required.'; ok = false; }
    if (!ok) return;
    if (Auth.login(u, p)) {
      showToast('Welcome back, ' + u + '!');
      window.location.hash = '#dashboard';
    } else {
      const ge = document.getElementById('login-general-err');
      ge.textContent = 'Invalid username or password.';
      ge.style.display = 'block';
    }
  });
}

function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    inp.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

/* ─── DASHBOARD ────────────────────────────────────────────────────────────── */
function renderDashboard() {
  if (!Auth.requireAuth()) return;
  const total = Reports.getTotalCount();
  const cityMap = Reports.getByCity();
  const cities = Object.keys(cityMap).length;
  const recent = Reports.getRecentlyAdded(5);

  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-subtitle">Welcome back, <strong>${escHtml(Auth.getUser()?.username || 'Admin')}</strong> — here's your overview</p>
      </div>
      <a href="#add" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Customer
      </a>
    </div>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: linear-gradient(135deg,#6c63ff,#8b82ff);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" id="anim-total">0</span>
          <span class="stat-label">Total Customers</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: linear-gradient(135deg,#ff6584,#ff8fa3);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" id="anim-cities">0</span>
          <span class="stat-label">Cities Covered</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: linear-gradient(135deg,#43e97b,#38f9d7);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${formatDate(recent[0]?.createdAt || null)}</span>
          <span class="stat-label">Last Added</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background: linear-gradient(135deg,#fa709a,#fee140);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${cities > 0 ? Math.round(total/cities*10)/10 : 0}</span>
          <span class="stat-label">Avg / City</span>
        </div>
      </div>
    </div>

    <div class="dashboard-lower">
      <div class="glass-card recent-card">
        <div class="card-header">
          <h3>Recently Added</h3>
          <a href="#customers" class="link-subtle">View All →</a>
        </div>
        <div class="recent-list">
          ${recent.length === 0 ? '<p class="empty-msg">No customers yet.</p>' : recent.map(c => `
            <div class="recent-item">
              <div class="avatar">${escHtml(c.name[0].toUpperCase())}</div>
              <div class="recent-info">
                <span class="recent-name">${escHtml(c.name)}</span>
                <span class="recent-meta">${escHtml(c.city)} · ${escHtml(c.phone)}</span>
              </div>
              <span class="recent-date">${formatDate(c.createdAt)}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="glass-card chart-card">
        <div class="card-header">
          <h3>Customers by City</h3>
        </div>
        <canvas id="city-chart" width="420" height="240"></canvas>
        ${cities === 0 ? '<p class="empty-msg center">No data to display.</p>' : ''}
      </div>
    </div>`;

  // Animate counters
  animateCounter('anim-total', total);
  animateCounter('anim-cities', cities);
  Reports.drawCityChart('city-chart');
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

/* ─── CUSTOMER LIST ─────────────────────────────────────────────────────────── */
let _searchDebounce = null;
function renderCustomers(query = '') {
  if (!Auth.requireAuth()) return;
  const all = query
    ? CustomerMgr.searchCustomers({ name: query, phone: query, city: query })
      .length > 0 ? (() => {
        // union search
        const byName  = CustomerMgr.searchCustomers({ name: query });
        const byPhone = CustomerMgr.searchCustomers({ phone: query });
        const byCity  = CustomerMgr.searchCustomers({ city: query });
        const merged = [...byName, ...byPhone, ...byCity];
        return [...new Map(merged.map(c => [c.id, c])).values()];
      })()
      : []
    : CustomerMgr.getAllCustomers();

  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Customers</h2>
        <p class="page-subtitle">${all.length} record${all.length !== 1 ? 's' : ''} found</p>
      </div>
      <a href="#add" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Customer
      </a>
    </div>

    <div class="search-bar-wrap glass-card">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="search-input" type="text" placeholder="Search by name, phone or city…" value="${escHtml(query)}" />
      ${query ? `<button class="clear-btn" id="clear-search">✕</button>` : ''}
    </div>

    <div class="glass-card table-card">
      ${all.length === 0
        ? `<div class="empty-state">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(108,99,255,0.5)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
             <p>No customers found</p>
             <a href="#add" class="btn btn-primary" style="margin-top:12px;">Add First Customer</a>
           </div>`
        : `<div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${all.map(c => `
                <tr class="table-row-anim">
                  <td><span class="badge-id">${escHtml(c.id)}</span></td>
                  <td>
                    <div class="customer-name-cell">
                      <div class="avatar sm">${escHtml(c.name[0].toUpperCase())}</div>
                      ${escHtml(c.name)}
                    </div>
                  </td>
                  <td>${escHtml(c.phone)}</td>
                  <td class="email-cell">${escHtml(c.email)}</td>
                  <td><span class="city-badge">${escHtml(c.city)}</span></td>
                  <td>${formatDate(c.createdAt)}</td>
                  <td>
                    <div class="action-btns">
                      <a href="#edit?id=${c.id}" class="btn btn-sm btn-outline" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </a>
                      <button class="btn btn-sm btn-danger" onclick="showDeleteModal('${c.id}')" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
          </div>`}
    </div>`;

  // Search live
  const si = document.getElementById('search-input');
  if (si) {
    si.addEventListener('input', () => {
      clearTimeout(_searchDebounce);
      _searchDebounce = setTimeout(() => renderCustomers(si.value.trim()), 250);
    });
    si.focus();
  }
  const clr = document.getElementById('clear-search');
  if (clr) clr.addEventListener('click', () => renderCustomers(''));
}

/* ─── ADD CUSTOMER ──────────────────────────────────────────────────────────── */
function renderAddCustomer() {
  if (!Auth.requireAuth()) return;
  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Add Customer</h2>
        <p class="page-subtitle">Fill in the details to register a new customer</p>
      </div>
      <a href="#customers" class="btn btn-outline">← Back</a>
    </div>
    <div class="glass-card form-card">
      ${customerFormHTML()}
      <div class="form-actions">
        <a href="#customers" class="btn btn-outline">Cancel</a>
        <button type="button" class="btn btn-primary" id="save-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Customer
        </button>
      </div>
    </div>`;

  attachFormValidation();
  document.getElementById('save-btn').addEventListener('click', () => {
    const data = collectFormData();
    const result = CustomerMgr.addCustomer(data);
    if (result.success) {
      showToast('Customer added successfully!');
      window.location.hash = '#customers';
    } else {
      applyErrors(result.errors);
    }
  });
}

/* ─── EDIT CUSTOMER ─────────────────────────────────────────────────────────── */
function renderEditCustomer() {
  if (!Auth.requireAuth()) return;
  const id = decodeURIComponent((window.location.hash.split('?id=')[1] || '').trim());
  const customer = CustomerMgr.getCustomer(id);
  if (!customer) {
    document.getElementById('page-content').innerHTML = `<div class="glass-card empty-state"><p>Customer not found.</p><a href="#customers" class="btn btn-outline">Back</a></div>`;
    return;
  }
  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Edit Customer</h2>
        <p class="page-subtitle">Updating: <strong>${escHtml(customer.name)}</strong> <span class="badge-id">${escHtml(id)}</span></p>
      </div>
      <a href="#customers" class="btn btn-outline">← Back</a>
    </div>
    <div class="glass-card form-card">
      ${customerFormHTML(customer)}
      <div class="form-actions">
        <a href="#customers" class="btn btn-outline">Cancel</a>
        <button type="button" class="btn btn-primary" id="save-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Update Customer
        </button>
      </div>
    </div>`;

  attachFormValidation(id);
  document.getElementById('save-btn').addEventListener('click', () => {
    const data = collectFormData();
    const result = CustomerMgr.updateCustomer(id, data);
    if (result.success) {
      showToast('Customer updated successfully!');
      window.location.hash = '#customers';
    } else {
      applyErrors(result.errors);
    }
  });
}

/* ─── Shared Form Helpers ───────────────────────────────────────────────────── */
function customerFormHTML(c = {}) {
  return `
    <div class="form-grid">
      <div class="form-group">
        <label for="f-name">Full Name <span class="req">*</span></label>
        <input id="f-name" type="text" placeholder="e.g. Aarav Sharma" value="${escHtml(c.name || '')}" maxlength="60"/>
        <span class="field-error" id="err-name"></span>
      </div>
      <div class="form-group">
        <label for="f-phone">Phone Number <span class="req">*</span></label>
        <input id="f-phone" type="tel" placeholder="10-digit mobile number" value="${escHtml(c.phone || '')}" maxlength="10"/>
        <span class="field-error" id="err-phone"></span>
      </div>
      <div class="form-group">
        <label for="f-email">Email Address <span class="req">*</span></label>
        <input id="f-email" type="email" placeholder="e.g. name@domain.com" value="${escHtml(c.email || '')}"/>
        <span class="field-error" id="err-email"></span>
      </div>
      <div class="form-group">
        <label for="f-city">City <span class="req">*</span></label>
        <input id="f-city" type="text" placeholder="e.g. Mumbai" value="${escHtml(c.city || '')}" maxlength="40"/>
        <span class="field-error" id="err-city"></span>
      </div>
      <div class="form-group form-group-full">
        <label for="f-address">Address <span class="req">*</span></label>
        <textarea id="f-address" rows="3" placeholder="Street, Area, Landmark…" maxlength="200">${escHtml(c.address || '')}</textarea>
        <span class="field-error" id="err-address"></span>
      </div>
    </div>`;
}

function collectFormData() {
  return {
    name:    document.getElementById('f-name').value,
    phone:   document.getElementById('f-phone').value,
    email:   document.getElementById('f-email').value,
    address: document.getElementById('f-address').value,
    city:    document.getElementById('f-city').value,
  };
}

function applyErrors(errors) {
  ['name','phone','email','address','city'].forEach(f => {
    const el = document.getElementById('err-' + f);
    if (el) el.textContent = errors[f] || '';
    const inp = document.getElementById('f-' + f);
    if (inp) inp.classList.toggle('input-error', !!errors[f]);
  });
}

function clearError(fieldId) {
  const el = document.getElementById('err-' + fieldId);
  if (el) el.textContent = '';
  const inp = document.getElementById('f-' + fieldId);
  if (inp) inp.classList.remove('input-error');
}

function attachFormValidation(excludeId = null) {
  ['name','phone','email','address','city'].forEach(f => {
    const inp = document.getElementById('f-' + f);
    if (inp) inp.addEventListener('input', () => clearError(f));
  });
}

/* ─── REPORTS PAGE ──────────────────────────────────────────────────────────── */
function renderReports() {
  if (!Auth.requireAuth()) return;
  const total = Reports.getTotalCount();
  const cityMap = Reports.getByCity();
  const recent = Reports.getRecentlyAdded(10);

  const cityRows = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => `
      <tr>
        <td>${escHtml(city)}</td>
        <td>${count}</td>
        <td>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width:${Math.round((count/total)*100)}%"></div>
          </div>
        </td>
        <td>${Math.round((count/total)*100)}%</td>
      </tr>`).join('');

  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Reports</h2>
        <p class="page-subtitle">Customer statistics and analytics overview</p>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3,1fr);">
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#6c63ff,#8b82ff);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="stat-info"><span class="stat-value">${total}</span><span class="stat-label">Total Customers</span></div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#ff6584,#ff8fa3);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="stat-info"><span class="stat-value">${Object.keys(cityMap).length}</span><span class="stat-label">Unique Cities</span></div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#43e97b,#38f9d7);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div class="stat-info"><span class="stat-value">${recent.filter(c => {
          const d = new Date(c.createdAt);
          const now = new Date();
          return (now - d) < 7 * 24 * 60 * 60 * 1000;
        }).length}</span><span class="stat-label">Added This Week</span></div>
      </div>
    </div>

    <div class="dashboard-lower">
      <div class="glass-card chart-card" style="flex:1.5;">
        <div class="card-header"><h3>City Distribution</h3></div>
        <canvas id="city-chart" width="520" height="260"></canvas>
      </div>
      <div class="glass-card" style="flex:1; overflow:auto;">
        <div class="card-header"><h3>By City</h3></div>
        <table class="data-table">
          <thead><tr><th>City</th><th>#</th><th>Share</th><th>%</th></tr></thead>
          <tbody>${cityRows || '<tr><td colspan="4" style="text-align:center;opacity:.5;">No data</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="glass-card" style="margin-top:24px;">
      <div class="card-header"><h3>Recently Added Customers</h3></div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Date Added</th></tr></thead>
          <tbody>
            ${recent.map(c => `
              <tr>
                <td><span class="badge-id">${escHtml(c.id)}</span></td>
                <td><div class="customer-name-cell"><div class="avatar sm">${escHtml(c.name[0].toUpperCase())}</div>${escHtml(c.name)}</div></td>
                <td>${escHtml(c.phone)}</td>
                <td>${escHtml(c.email)}</td>
                <td><span class="city-badge">${escHtml(c.city)}</span></td>
                <td>${formatDate(c.createdAt)}</td>
              </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;opacity:.5;">No customers yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;

  Reports.drawCityChart('city-chart');
}

/* ─── Delete confirm ────────────────────────────────────────────────────────── */
function setupDeleteModal() {
  document.getElementById('delete-confirm').addEventListener('click', () => {
    if (_pendingDeleteId) {
      const ok = CustomerMgr.deleteCustomer(_pendingDeleteId);
      hideDeleteModal();
      if (ok) showToast('Customer deleted.', 'success');
      else showToast('Delete failed.', 'error');
      renderCustomers();
    }
  });
  document.getElementById('delete-cancel').addEventListener('click', hideDeleteModal);
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideDeleteModal();
  });
}

/* ─── Bootstrap ─────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Clear any previously seeded demo data (one-time migration)
  const demoFlag = localStorage.getItem('cms_demo_cleared');
  if (!demoFlag) {
    localStorage.removeItem('cms_customers');
    localStorage.removeItem('cms_next_id');
    localStorage.setItem('cms_demo_cleared', '1');
  }

  setupDeleteModal();

  document.getElementById('logout-btn').addEventListener('click', Auth.logout);

  window.addEventListener('hashchange', () => Router.render());
  Router.render();
});
