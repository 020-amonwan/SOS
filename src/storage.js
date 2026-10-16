const DRAFT_KEY = 'flood_sos_draft_v1';
const INCIDENTS_KEY = 'flood_sos_incidents_v1';

export function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveSubmittedIncident(incident) {
  try {
    const existing = JSON.parse(localStorage.getItem(INCIDENTS_KEY) || '[]');
    existing.unshift(incident);
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Failed to save incident:', e);
  }
}

export function generateCaseID() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SOS-2026-${rand}`;
}
