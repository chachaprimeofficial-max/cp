import Link from 'next/link';
import { getProducts } from '../../lib/api';

export default async function ShopPage() {
  const data = await getProducts({ limit: 24 });

  return (
    <main className="shop-page">
      <div className="shop-head">
        <div>
          <span className="eyebrow">CHACHA PRIME COLLECTION</span>
          <h1>Shop smarter.</h1>
          <p>Premium products selected for quality, value and everyday life.</p>
        </div>
        <Link href="/" className="secondary">Back home</Link>
      </div>
      <section className="product-grid">
        {data.items.map((product) => (
          <Link href={`/shop/${product.slug}`} className="product-card" key={product._id}>
            <div className="product-image">
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <span>PRIME</span>}
            </div>
            <div className="product-info">
              <h2>{product.name}</h2>
              <strong>£{product.price.toFixed(2)}</strong>
              {product.compareAtPrice ? <del>£{product.compareAtPrice.toFixed(2)}</del> : null}
            </div>
          </Link>
        ))}
      </section>
      {!data.items.length && <div className="empty-state">No products are available yet. Add products from the admin dashboard.</div>}
    </main>
  );
}
