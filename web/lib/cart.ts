export type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
};

const KEY = 'cp_cart';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cp-cart-updated'));
}

export function addToCart(item: CartItem) {
  const items = readCart();
  const existing = items.find((x) => x.productId === item.productId);
  if (existing) existing.quantity += item.quantity;
  else items.push(item);
  writeCart(items);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
