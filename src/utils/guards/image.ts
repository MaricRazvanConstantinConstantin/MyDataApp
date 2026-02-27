export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(String(url).trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const pathname = u.pathname || '';
    const parts = pathname.split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'];
    return allowed.includes(ext);
  } catch (err) {
    console.error('Error validating image URL:', err);
    return false;
  }
}

export async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {method: 'HEAD'});
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    return ct.startsWith('image/');
  } catch (err) {
    console.error('Error verifying image URL:', err);
    return false;
  }
}

export default isValidImageUrl;
