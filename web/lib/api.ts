const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: string[];
  featured?: boolean;
  categoryId?: string;
  tags?: string[];
};

export type ProductResponse = {
  items: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export async function getProducts(params: { q?: string; category?: string; page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const response = await fetch(`${API_URL}/api/v1/products?${search.toString()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load products');
  return response.json() as Promise<ProductResponse>;
}

export async function getProduct(slug: string) {
  const response = await fetch(`${API_URL}/api/v1/products/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json() as Promise<Product>;
}
