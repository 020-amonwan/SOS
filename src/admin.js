import { getSession, login, logout, isAdminLoggedIn, ADMIN_EMAIL } from './auth.js';

export function initAdminUI(onStatusChange) {
  renderAdminHeaderBtn();
  initAuthModal(onStatusChange);
  initAdminDashboardModal();
}

function renderAdminHeaderBtn() {
  const header = document.querySelector('header .max-w-lg');
  if (!header) return;

  let btnContainer = document.getElementById('admin-header-container');
  if (!btnContainer) {
    btnContainer = document.createElement('div');
    btnContainer.id = 'admin-header-container';
    header.appendChild(btnContainer);
  }

  const session = getSession();
  const isAdmin = isAdminLoggedIn();

  if (isAdmin) {
    btnContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <button id="btn-open-dashboard" class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1.5 hover:bg-amber-900 transition">
          <span>👑 Admin</span>
        </button>
        <button id="btn-admin-logout" title="ออกจากระบบ" class="text-xs text-slate-400 hover:text-red-400">🚪</button>
      </div>
    `;
    document.getElementById('btn-open-dashboard')?.addEventListener('click', () => {
      openDashboardModal();
    });
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      logout();
      renderAdminHeaderBtn();
      alert('ออกจากระบบแอดมินเรียบร้อยแล้ว');
      window.location.reload();
    });
  } else {
    btnContainer.innerHTML = `
      <button id="btn-open-login" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition">
        🔑 แอดมิน
      </button>
    `;
    document.getElementById('btn-open-login')?.addEventListener('click', () => {
      openLoginModal();
    });
  }
}

function initAuthModal(onStatusChange) {
  let modal = document.getElementById('admin-login-modal');
  if (modal) return;

  modal = document.createElement('div');
  modal.id = 'admin-login-modal';
  modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden';
  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>🔐</span> เข้าสู่ระบบผู้ดูแลระบบ (Admin)
        </h3>
        <button id="btn-close-login" class="text-slate-400 hover:text-white">✕</button>
      </div>

      <div class="bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl text-xs text-amber-300">
        👑 สิทธิ์ Super Admin ถูกกำหนดให้แก่:<br>
        <span class="font-mono font-bold text-amber-200">${ADMIN_EMAIL}</span>
      </div>

      <form id="admin-login-form" class="space-y-3" onsubmit="return false;">
        <div>
          <label class="text-xs text-slate-300 block mb-1">อีเมลแอดมิน</label>
          <input type="email" id="login-email" value="${ADMIN_EMAIL}" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500">
        </div>

        <div>
          <label class="text-xs text-slate-300 block mb-1">รหัสผ่าน / Passcode</label>
          <input type="password" id="login-passcode" placeholder="admin1234 หรือกรอกอะไรก็ได้" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500">
        </div>

        <div class="pt-2 space-y-2">
          <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg">
            เข้าสู่ระบบแอดมิน (Sign In)
          </button>
          
          <button type="button" id="btn-quick-admin" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-[11px] border border-slate-700">
            ⚡ Quick Test: เข้าสู่ระบบในนาม ${ADMIN_EMAIL}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-login')?.addEventListener('click', closeLoginModal);
  document.getElementById('admin-login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('btn-quick-admin')?.addEventListener('click', () => {
    login(ADMIN_EMAIL);
    closeLoginModal();
    renderAdminHeaderBtn();
    alert(`เข้าสู่ระบบในสิทธิ์ Super Admin: ${ADMIN_EMAIL} เรียบร้อยแล้ว`);
    openDashboardModal();
  });

  function handleLogin() {
    const email = document.getElementById('login-email')?.value || '';
    const session = login(email);
    closeLoginModal();
    renderAdminHeaderBtn();

    if (session.role === 'SUPER_ADMIN') {
      alert(`ยินดีต้อนรับ Super Admin (${session.email}) เข้าสู่ระบบบริหารจัดการศูนย์กู้ภัย`);
      openDashboardModal();
    } else {
      alert(`เข้าสู่ระบบสำเร็จในฐานะผู้ใช้ทั่วไป (${session.email})`);
    }
  }
}

export function openLoginModal() {
  document.getElementById('admin-login-modal')?.classList.remove('hidden');
}

export function closeLoginModal() {
  document.getElementById('admin-login-modal')?.classList.add('hidden');
}

function initAdminDashboardModal() {
  let modal = document.getElementById('admin-dashboard-modal');
  if (modal) return;

  modal = document.createElement('div');
  modal.id = 'admin-dashboard-modal';
  modal.className = 'fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 hidden';
  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
      <!-- Dashboard Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="p-2 bg-amber-950 text-amber-400 rounded-xl text-lg border border-amber-800">👑</span>
          <div>
            <h3 class="text-base font-bold text-white">ศูนย์บัญชาการกู้ภัย (Command Center Dashboard)</h3>
            <div class="text-xs text-amber-400 font-mono">Super Admin: ${ADMIN_EMAIL}</div>
          </div>
        </div>
        <button id="btn-close-dashboard" class="text-slate-400 hover:text-white p-1 text-lg">✕</button>
      </div>

      <!-- Stats Summary Cards -->
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div class="text-slate-400 text-[10px]">รวมแจ้งเหตุทั้งหมด</div>
          <div id="stat-total" class="text-lg font-black text-white">0</div>
        </div>
        <div class="bg-red-950/40 p-2.5 rounded-xl border border-red-800/60">
          <div class="text-red-400 text-[10px]">🔴 วิกฤตด่วนที่สุด</div>
          <div id="stat-red" class="text-lg font-black text-red-500">0</div>
        </div>
        <div class="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60">
          <div class="text-amber-400 text-[10px]">🟡 เคสเร่งด่วน</div>
          <div id="stat-yellow" class="text-lg font-black text-amber-400">0</div>
        </div>
        <div class="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
          <div class="text-emerald-400 text-[10px]">🟢 ช่วยเหลือแล้ว</div>
          <div id="stat-rescued" class="text-lg font-black text-emerald-400">0</div>
        </div>
      </div>

      <!-- Filters & Refresh -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-1.5 text-xs">
          <button class="dash-filter active bg-blue-600 text-white px-3 py-1 rounded-lg font-bold" data-filter="ALL">ทั้งหมด</button>
          <button class="dash-filter bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1 rounded-lg" data-filter="RED">🔴 เคสสีแดง</button>
          <button class="dash-filter bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1 rounded-lg" data-filter="YELLOW">🟡 เคสสีเหลือง</button>
        </div>
        <button id="btn-refresh-incidents" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
          🔄 อัปเดตข้อมูล
        </button>
      </div>

      <!-- Incident Table / Cards List -->
      <div id="incidents-list-container" class="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[250px]">
        <!-- Dynamic list -->
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-dashboard')?.addEventListener('click', closeDashboardModal);
  document.getElementById('btn-refresh-incidents')?.addEventListener('click', loadAndRenderIncidents);

  document.querySelectorAll('.dash-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-filter').forEach(b => {
        b.className = 'dash-filter bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1 rounded-lg';
      });
      btn.className = 'dash-filter active bg-blue-600 text-white px-3 py-1 rounded-lg font-bold';
      const filter = btn.getAttribute('data-filter') || 'ALL';
      loadAndRenderIncidents(filter);
    });
  });
}

export function openDashboardModal() {
  document.getElementById('admin-dashboard-modal')?.classList.remove('hidden');
  loadAndRenderIncidents();
}

export function closeDashboardModal() {
  document.getElementById('admin-dashboard-modal')?.classList.add('hidden');
}

async function loadAndRenderIncidents(filter = 'ALL') {
  const container = document.getElementById('incidents-list-container');
  if (!container) return;

  container.innerHTML = `<div class="text-center text-xs text-slate-500 py-8">กำลังดึงข้อมูลเคสทั้งหมด...</div>`;

  let incidents = [];

  // Fetch from Cloudflare API or fallback to LocalStorage
  try {
    const res = await fetch('/api/incidents');
    if (res.ok) {
      incidents = await res.json();
    }
  } catch (e) {
    // fallback
  }

  if (!incidents.length) {
    const localRaw = localStorage.getItem('flood_sos_incidents_v1');
    incidents = localRaw ? JSON.parse(localRaw) : [];
  }

  // Update Stats
  const statTotal = document.getElementById('stat-total');
  const statRed = document.getElementById('stat-red');
  const statYellow = document.getElementById('stat-yellow');
  const statRescued = document.getElementById('stat-rescued');

  if (statTotal) statTotal.textContent = incidents.length;
  if (statRed) statRed.textContent = incidents.filter(i => i.triageCategory === 'RED').length;
  if (statYellow) statYellow.textContent = incidents.filter(i => i.triageCategory === 'YELLOW').length;
  if (statRescued) statRescued.textContent = incidents.filter(i => i.status === 'RESCUED').length;

  // Filter
  if (filter === 'RED') incidents = incidents.filter(i => i.triageCategory === 'RED');
  if (filter === 'YELLOW') incidents = incidents.filter(i => i.triageCategory === 'YELLOW');

  if (!incidents.length) {
    container.innerHTML = `
      <div class="text-center text-xs text-slate-500 py-12 bg-slate-950/40 rounded-xl border border-slate-800">
        ยังไม่มีรายการแจ้งเหตุในกลุ่มนี้
      </div>
    `;
    return;
  }

  container.innerHTML = incidents.map(inc => {
    const isRed = inc.triageCategory === 'RED';
    const isYellow = inc.triageCategory === 'YELLOW';
    const badgeBg = isRed ? 'bg-red-950 text-red-400 border-red-800' : isYellow ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800';
    const badgeTitle = isRed ? '🔴 วิกฤตด่วนที่สุด' : isYellow ? '🟡 เร่งด่วน' : '🟢 ทั่วไป';

    return `
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-sm text-white">${inc.caseID || 'SOS-2026'}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}">${badgeTitle}</span>
          </div>
          <div class="text-[11px] font-mono text-slate-400">${inc.submittedAt ? new Date(inc.submittedAt).toLocaleTimeString('th-TH') : ''}</div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>📍 พิกัด: <span class="font-mono text-blue-400">${inc.lat || '-'}, ${inc.lng || '-'}</span></div>
          <div>👤 ผู้แจ้ง: <span class="font-bold text-white">${inc.reporterName || 'ไม่ระบุ'}</span> (${inc.reporterMobile || '-'})</div>
          <div>👥 จำนวนคน: <span class="font-bold text-amber-400">${inc.totalCount || 1} คน</span></div>
          <div>🏠 จุดสังเกต: <span class="text-slate-300">${inc.landmark || '-'}</span></div>
        </div>

        ${inc.isBedridden ? `<div class="text-[11px] font-bold text-red-400 bg-red-950/60 px-2 py-1 rounded border border-red-800/60">⚠️ มีผู้ป่วยติดเตียง</div>` : ''}

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div class="text-[11px] text-slate-400">สถานะ: <span class="font-bold text-amber-400">${inc.status || 'PENDING (รอทีมเรือ)'}</span></div>
          <div class="flex gap-1.5">
            <button onclick="window.updateCaseStatus('${inc.caseID}', 'ASSIGNED')" class="px-2.5 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-200 text-[11px] font-bold rounded">ส่งทีมกู้ภัย</button>
            <button onclick="window.updateCaseStatus('${inc.caseID}', 'RESCUED')" class="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold rounded">ช่วยสำเร็จแล้ว</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.updateCaseStatus = async function(caseID, newStatus) {
  try {
    await fetch(`/api/incidents/${caseID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {}

  const localRaw = localStorage.getItem('flood_sos_incidents_v1');
  if (localRaw) {
    const list = JSON.parse(localRaw);
    const item = list.find(i => i.caseID === caseID);
    if (item) {
      item.status = newStatus;
      localStorage.setItem('flood_sos_incidents_v1', JSON.stringify(list));
    }
  }

  loadAndRenderIncidents();
};
