const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images?: string[];
  featured?: boolean;
};

export async function getProducts() {
  const response = await fetch(`${API_URL}/api/v1/products?limit=12`);
  if (!response.ok) throw new Error('Unable to load products');
  return response.json() as Promise<{ items: Product[] }>;
}
