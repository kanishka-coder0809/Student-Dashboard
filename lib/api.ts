export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function api(path: string) {
  // ensure leading slash
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE}${path}`;
}
