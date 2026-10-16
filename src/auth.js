/**
 * Authentication Module
 * Admin Email: seree999@gmail.com
 */

const AUTH_KEY = 'flood_sos_auth_session';
export const ADMIN_EMAIL = 'seree999@gmail.com';

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function login(email, passcode = '') {
  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;
  
  const session = {
    email: cleanEmail,
    role: isAdmin ? 'SUPER_ADMIN' : 'USER',
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdminLoggedIn() {
  const session = getSession();
  return session && session.role === 'SUPER_ADMIN' && session.email === ADMIN_EMAIL;
}
