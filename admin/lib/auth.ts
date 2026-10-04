export const TOKEN_KEY = 'cp_access_token';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
  isActive: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to sign in.');

  if (data.user?.role !== 'admin') {
    throw new Error('Administrator access is required.');
  }

  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data as { user: AdminUser; accessToken: string };
}

export async function getAdminMe(token: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;

  const user = await response.json() as AdminUser;
  return user.role === 'admin' && user.isActive ? user : null;
}

export function adminLogout() {
  localStorage.removeItem(TOKEN_KEY);
}