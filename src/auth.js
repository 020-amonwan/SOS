/**
 * Authentication Module
 * Admin Email: seree999@gmail.com
 * Google OAuth Client ID: 414030598909-8bdcbtcetlb7i9thbie7bj6bbmnhekjr.apps.googleusercontent.com
 */

const AUTH_KEY = 'flood_sos_auth_session';
export const ADMIN_EMAIL = 'seree999@gmail.com';
export const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '414030598909-8bdcbtcetlb7i9thbie7bj6bbmnhekjr.apps.googleusercontent.com';

/**
 * ฟังก์ชันถอดรหัส JWT Token ที่ Google ส่งกลับมา
 */
export function decodeJwtResponse(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT response:', e);
    return null;
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * เข้าสู่ระบบด้วย Google Credential
 */
export function loginWithGoogle(credentialToken) {
  const payload = typeof credentialToken === 'string' ? decodeJwtResponse(credentialToken) : credentialToken;
  if (!payload || !payload.email) return null;

  const cleanEmail = payload.email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const session = {
    email: cleanEmail,
    name: payload.name || cleanEmail.split('@')[0],
    picture: payload.picture || '',
    role: isAdmin ? 'SUPER_ADMIN' : 'USER',
    token: `google_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loggedInAt: new Date().toISOString(),
    authProvider: 'google'
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

/**
 * เข้าสู่ระบบด้วย Email / Passcode ทั่วไป
 */
export function login(email, passcode = '') {
  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;
  
  const session = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    picture: '',
    role: isAdmin ? 'SUPER_ADMIN' : 'USER',
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loggedInAt: new Date().toISOString(),
    authProvider: 'email'
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
    } catch (e) {
      console.warn('Google logout warning:', e);
    }
  }
}

export function isAdminLoggedIn() {
  const session = getSession();
  return session && session.role === 'SUPER_ADMIN' && session.email === ADMIN_EMAIL;
}
