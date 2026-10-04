import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '../../../lib/api';
import AddToCart from '../../../components/add-to-cart';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <main className="detail-page">
      <Link href="/shop" className="back-link">Back to shop</Link>
      <section className="detail-grid">
        <div className="detail-image">
          {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <span>PRIME</span>}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{product.featured ? 'PRIME PICK' : 'CHACHA PRIME'}</span>
          <h1>{product.name}</h1>
          <div className="price">£{product.price.toFixed(2)}</div>
          {product.compareAtPrice ? <del>Was £{product.compareAtPrice.toFixed(2)}</del> : null}
          <p>{product.description || 'A carefully selected Chacha Prime product.'}</p>
          <AddToCart product={product} />
        </div>
      </section>
    </main>
  );
}
