export const TOKEN_KEY = 'cp_access_token';

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
  isActive: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function authenticate(path: 'login' | 'register', body: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/api/v1/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Authentication failed');
  return data as { user: User; accessToken: string };
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json() as Promise<User>;
}

export async function createOrder(token: string, body: { items: { productId: string; quantity: number }[]; shippingAddress: Record<string, unknown> }) {
  const response = await fetch(`${API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to create order');
  return data;
}
