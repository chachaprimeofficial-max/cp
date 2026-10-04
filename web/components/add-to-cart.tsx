'use client';

import { useState } from 'react';
import { addToCart } from '../lib/cart';

export default function AddToCart({ product }: { product: { _id: string; name: string; price: number; images?: string[] } }) {
  const [added, setAdded] = useState(false);
  return <button className="primary" onClick={() => { addToCart({ productId: product._id, name: product.name, quantity: 1, unitPrice: product.price, image: product.images?.[0] }); setAdded(true); setTimeout(() => setAdded(false), 1200); }}>{added ? 'Added to cart' : 'Add to cart'}</button>;
}
