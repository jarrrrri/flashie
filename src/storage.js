import AsyncStorage from '@react-native-async-storage/async-storage';

const INBOX_KEY = '@flashie_inbox';
const DECKS_KEY = '@flashie_decks';
const SETTINGS_KEY = '@flashie_settings';
const THEME_KEY = '@flashie_theme';

// ─── Inbox ───────────────────────────────────────────────
export async function loadInbox() {
  try {
    const raw = await AsyncStorage.getItem(INBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveInbox(items) {
  try { await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(items)); } catch {}
}

// ─── Decks ───────────────────────────────────────────────
export async function loadDecks() {
  try {
    const raw = await AsyncStorage.getItem(DECKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveDecks(decks) {
  try { await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(decks)); } catch {}
}

// ─── Settings ────────────────────────────────────────────
export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings();
  } catch { return defaultSettings(); }
}

export async function saveSettings(settings) {
  try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

function defaultSettings() {
  return { haptics: true, sound: false, animation: true, shake: false, dailyGoal: 20, reminder: true };
}

// ─── Theme ───────────────────────────────────────────────
export async function loadThemeKey() {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    return raw || 'minimal-white';
  } catch { return 'minimal-white'; }
}

export async function saveThemeKey(key) {
  try { await AsyncStorage.setItem(THEME_KEY, key); } catch {}
}

// ─── Bucket helpers ──────────────────────────────────────
export function makeBucket(savedAt) {
  const now = new Date();
  const d = new Date(savedAt);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  if (d >= todayStart) return 'today';
  if (d >= yesterdayStart) return 'yesterday';
  return 'earlier';
}

export function makeTimeLabel(savedAt) {
  const now = new Date();
  const d = new Date(savedAt);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  if (d >= todayStart) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d >= yesterdayStart) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short' });
}
