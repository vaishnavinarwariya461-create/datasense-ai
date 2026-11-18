/**
 * DataSense AI — Pro License Management System
 * Allows instant, manual, or magic-link VIP activation.
 */

const STORAGE_KEY = 'datasense_pro_license';

// Master VIP Keys that you can give to users who pay via UPI
const VALID_PRO_KEYS = [
  'PRO-NEERAJ-2026',
  'DATASENSE-PRO-2026',
  'NEERAJ-VIP-PRO',
  'DS-PRO-VIP-100',
  'DS-PRO-ANALYST',
];

/**
 * Check if the current user has unlocked Pro status
 * @returns {boolean}
 */
export function isProUser() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (!val) return false;
    const parsed = JSON.parse(val);
    return Boolean(parsed && parsed.active);
  } catch {
    return false;
  }
}

/**
 * Get stored license details
 */
export function getProLicense() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/**
 * Validates a key and activates Pro if correct.
 * Accepts any key from VALID_PRO_KEYS or any key starting with 'DS-PRO-'
 * @param {string} rawKey
 * @returns {{ success: boolean, message: string }}
 */
export function activateProKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') {
    return { success: false, message: 'Kripya ek valid key daalein.' };
  }

  const cleanKey = rawKey.trim().toUpperCase();

  const isValid =
    VALID_PRO_KEYS.includes(cleanKey) ||
    (cleanKey.startsWith('DS-PRO-') && cleanKey.length >= 10);

  if (!isValid) {
    return {
      success: false,
      message: 'Invalid Activation Key! Apne LinkedIn par Neeraj se sampark karein.',
    };
  }

  const record = {
    active: true,
    key: cleanKey,
    activatedAt: new Date().toISOString(),
    plan: 'pro',
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event('datasense_pro_changed'));

  return {
    success: true,
    message: '🎉 Pro Access Successfully Activated! Swagat hai VIP club me!',
  };
}

/**
 * Auto-detect ?pro_key= in URL on app startup and auto-activate
 */
export function checkUrlForProKey() {
  try {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('pro_key') || params.get('activate_key');
    if (key) {
      const res = activateProKey(key);
      if (res.success) {
        // Clean URL without reloading
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return res;
      }
    }
  } catch {}
  return null;
}
