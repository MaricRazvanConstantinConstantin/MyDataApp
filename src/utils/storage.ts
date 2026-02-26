export function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`storage.getJson failed for "${key}":`, err);
    return fallback;
  }
}

export function setJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`storage.setJson failed for "${key}":`, err);
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`storage.remove failed for "${key}":`, err);
  }
}

export function getString(key: string, fallback = ''): string {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ?? fallback;
  } catch (err) {
    console.warn(`storage.getString failed for "${key}":`, err);
    return fallback;
  }
}

export function setString(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`storage.setString failed for "${key}":`, err);
  }
}
