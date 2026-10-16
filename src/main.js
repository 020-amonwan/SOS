import './style.css';
import { calculateTriage } from './triage.js';
import { saveDraft, loadDraft, saveSubmittedIncident, generateCaseID } from './storage.js';
import { initMap, updateMapLocation } from './map.js';
import { initAdminUI } from './admin.js';
import { initChatbot } from './chatbot.js';
import { getSession } from './auth.js';

let state = {
  lat: null,
  lng: null,
  landmark: '',
  totalCount: 1,
  isBedridden: false,
  hasMedicalDevice: false,
  isElderly: false,
  isChildren: false,
  waterLevel: 'KNEE',
  foodStatus: 'ENOUGH',
  reporterName: '',
  reporterMobile: '',
  reporterRel: 'SELF'
};

document.addEventListener('DOMContentLoaded', () => {
  initNetworkStatus();
  initFormInteractions();
  restoreDraftIfAny();
  updateTriageDisplay();
  initAdminUI();
  initChatbot();
});

function initNetworkStatus() {
  const badgeText = document.getElementById('network-text');
  const updateStatus = () => {
    if (navigator.onLine) {
      if (badgeText) badgeText.textContent = 'ออนไลน์ (Cloudflare Sync)';
    } else {
      if (badgeText) badgeText.textContent = 'ออฟไลน์ (โหมดร่างข้อมูล)';
    }
  };
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
}

function initFormInteractions() {
  // GPS Button
  const btnGps = document.getElementById('btn-get-gps');
  if (btnGps) {
    btnGps.addEventListener('click', handleGetGPS);
  }

  // Count Buttons
  const totalInput = document.getElementById('total-count');
  document.getElementById('btn-minus-count')?.addEventListener('click', () => {
    if (state.totalCount > 1) {
      state.totalCount--;
      if (totalInput) totalInput.value = state.totalCount;
      onFormChange();
    }
  });
  document.getElementById('btn-plus-count')?.addEventListener('click', () => {
    state.totalCount++;
    if (totalInput) totalInput.value = state.totalCount;
    onFormChange();
  });
  totalInput?.addEventListener('change', (e) => {
    state.totalCount = Math.max(1, parseInt(e.target.value) || 1);
    onFormChange();
  });

  // Checkboxes
  ['chk-bedridden', 'chk-medical-device', 'chk-elderly', 'chk-children'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      state.isBedridden = document.getElementById('chk-bedridden')?.checked || false;
      state.hasMedicalDevice = document.getElementById('chk-medical-device')?.checked || false;
      state.isElderly = document.getElementById('chk-elderly')?.checked || false;
      state.isChildren = document.getElementById('chk-children')?.checked || false;
      onFormChange();
    });
  });

  // Water Level Buttons
  const waterBtns = document.querySelectorAll('.water-btn');
  waterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      waterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.waterLevel = btn.getAttribute('data-water') || 'KNEE';
      onFormChange();
    });
  });

  document.querySelector('.water-btn[data-water="KNEE"]')?.classList.add('active');

  // Inputs
  document.getElementById('landmark')?.addEventListener('input', (e) => {
    state.landmark = e.target.value;
    onFormChange();
  });
  document.getElementById('food-status')?.addEventListener('change', (e) => {
    state.foodStatus = e.target.value;
    onFormChange();
  });
  document.getElementById('reporter-name')?.addEventListener('input', (e) => {
    state.reporterName = e.target.value;
    onFormChange();
  });
  document.getElementById('reporter-mobile')?.addEventListener('input', (e) => {
    state.reporterMobile = e.target.value;
    onFormChange();
  });
  document.getElementById('reporter-rel')?.addEventListener('change', (e) => {
    state.reporterRel = e.target.value;
    onFormChange();
  });

  // Submit SOS
  document.getElementById('btn-submit-sos')?.addEventListener('click', handleSubmitSOS);
  document.getElementById('btn-sms-fallback')?.addEventListener('click', handleSMSFallback);
  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    document.getElementById('case-modal')?.classList.add('hidden');
  });
}

function handleGetGPS() {
  const gpsStatus = document.getElementById('gps-status');
  if (!navigator.geolocation) {
    if (gpsStatus) gpsStatus.textContent = 'เบราว์เซอร์ไม่รองรับ GPS';
    return;
  }

  if (gpsStatus) gpsStatus.textContent = 'กำลังดึงพิกัด...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.lat = parseFloat(pos.coords.latitude.toFixed(6));
      state.lng = parseFloat(pos.coords.longitude.toFixed(6));

      const latInput = document.getElementById('lat');
      const lngInput = document.getElementById('lng');
      if (latInput) latInput.value = state.lat;
      if (lngInput) lngInput.value = state.lng;

      if (gpsStatus) gpsStatus.textContent = `พิกัดแม่นยำ (±${Math.round(pos.coords.accuracy)}m)`;
      
      initMap('map', state.lat, state.lng, (newLat, newLng) => {
        state.lat = parseFloat(newLat.toFixed(6));
        state.lng = parseFloat(newLng.toFixed(6));
        if (latInput) latInput.value = state.lat;
        if (lngInput) lngInput.value = state.lng;
        onFormChange();
      });
      updateMapLocation(state.lat, state.lng);

      onFormChange();
    },
    (err) => {
      if (gpsStatus) gpsStatus.textContent = 'ดึงพิกัดไม่สำเร็จ กรุณากรอกบ้านเลขที่';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function onFormChange() {
  updateTriageDisplay();
  saveDraft(state);
}

function updateTriageDisplay() {
  const triage = calculateTriage(state);

  const banner = document.getElementById('triage-banner');
  const dot = document.getElementById('triage-dot');
  const title = document.getElementById('triage-title');
  const code = document.getElementById('triage-badge-code');

  if (banner) banner.className = `p-3.5 rounded-xl border transition-all duration-300 ${triage.bannerClass}`;
  if (dot) dot.className = `w-4 h-4 rounded-full ${triage.dotClass}`;
  if (title) {
    title.textContent = triage.title;
    title.className = `text-sm font-bold ${triage.titleClass}`;
  }
  if (code) code.textContent = triage.badgeCode;
}

async function handleSubmitSOS() {
  if (!state.reporterMobile) {
    alert('กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้');
    document.getElementById('reporter-mobile')?.focus();
    return;
  }

  const triage = calculateTriage(state);
  const caseID = generateCaseID();
  const nowStr = new Date().toLocaleString('th-TH');

  const incident = {
    caseID,
    ...state,
    triageCategory: triage.code,
    status: 'PENDING',
    submittedAt: new Date().toISOString()
  };

  // 1. Save Locally
  saveSubmittedIncident(incident);

  // 2. Post to Cloudflare Workers API
  try {
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
  } catch (e) {
    console.warn('API Sync Error:', e);
  }

  // Populate Modal
  const modalCaseId = document.getElementById('modal-case-id');
  const modalCoords = document.getElementById('modal-coords');
  const modalTime = document.getElementById('modal-time');
  const modalTag = document.getElementById('modal-triage-tag');

  if (modalCaseId) modalCaseId.textContent = caseID;
  if (modalCoords) modalCoords.textContent = state.lat && state.lng ? `${state.lat}, ${state.lng}` : 'ระบุที่อยู่ระบุในข้อความ';
  if (modalTime) modalTime.textContent = nowStr;
  if (modalTag) {
    modalTag.textContent = triage.title;
  }

  document.getElementById('case-modal')?.classList.remove('hidden');
}

function handleSMSFallback() {
  const triage = calculateTriage(state);
  const latStr = state.lat || 'N/A';
  const lngStr = state.lng || 'N/A';
  const bodyText = `SOS น้ำท่วม พิกัด:${latStr},${lngStr} คน:${state.totalCount} ติดเตียง:${state.isBedridden ? 'มี' : 'ไม่มี'} น้ำ:${state.waterLevel} บ้าน:${state.landmark || '-'} โทร:${state.reporterMobile}`;

  const smsUrl = `sms:4554321?body=${encodeURIComponent(bodyText)}`;
  window.location.href = smsUrl;
}

function restoreDraftIfAny() {
  const draft = loadDraft();
  if (draft) {
    state = { ...state, ...draft };
    if (state.landmark) {
      const el = document.getElementById('landmark');
      if (el) el.value = state.landmark;
    }
    if (state.totalCount) {
      const el = document.getElementById('total-count');
      if (el) el.value = state.totalCount;
    }
    if (state.reporterName) {
      const el = document.getElementById('reporter-name');
      if (el) el.value = state.reporterName;
    }
    if (state.reporterMobile) {
      const el = document.getElementById('reporter-mobile');
      if (el) el.value = state.reporterMobile;
    }
    if (state.lat && state.lng) {
      const latInput = document.getElementById('lat');
      const lngInput = document.getElementById('lng');
      if (latInput) latInput.value = state.lat;
      if (lngInput) lngInput.value = state.lng;
    }
  }

  // Pre-fill user name from login session if empty
  const session = getSession();
  if (session && session.name && !state.reporterName) {
    state.reporterName = session.name;
    const nameEl = document.getElementById('reporter-name');
    if (nameEl) nameEl.value = session.name;
  }
}
