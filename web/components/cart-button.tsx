'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCart } from '../lib/cart';

export default function CartButton() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readCart().reduce((n, item) => n + item.quantity, 0));
    update();
    window.addEventListener('cp-cart-updated', update);
    return () => window.removeEventListener('cp-cart-updated', update);
  }, []);
  return <Link href="/cart" className="cart-link">Cart {count ? `(${count})` : ''}</Link>;
}
