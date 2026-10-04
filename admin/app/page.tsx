'use client';

import { useEffect, useMemo, useState } from 'react';

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  featured?: boolean;
  isActive?: boolean;
  categoryId?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/products?limit=60`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Unable to load products')))
      .then((data) => setProducts(data.items || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    products: products.length,
    active: products.filter((p) => p.isActive !== false).length,
    lowStock: products.filter((p) => p.stock <= 5).length,
    featured: products.filter((p) => p.featured).length,
  }), [products]);

  const recent = products.slice(0, 6);

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.svg" alt="Chacha Prime" />
          <div><strong>CHACHA PRIME</strong><small>ADMIN CONSOLE</small></div>
        </div>
        <nav className="nav">
          <a className="active" href="/">Overview</a>
          <a href="#products">Products</a>
          <a href="#orders">Orders</a>
          <a href="#customers">Customers</a>
          <a href="#inventory">Inventory</a>
          <a href="#marketing">Marketing</a>
          <a href="#ai-insights">AI Insights</a>
        </nav>
        <div className="sidebar-footer">Single-vendor commerce operations.<br/>Built for Chacha Prime.</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div><span className="eyebrow">COMMAND CENTER</span><h1>Operations overview</h1><div className="muted">Monitor catalog health and prepare the store for scale.</div></div>
          <div className="status">SYSTEM FOUNDATION</div>
        </div>

        <section className="metrics">
          <div className="metric"><span>Total products</span><strong>{loading ? '—' : stats.products}</strong><small>Catalog records</small></div>
          <div className="metric"><span>Active catalog</span><strong>{loading ? '—' : stats.active}</strong><small>Customer-visible products</small></div>
          <div className="metric"><span>Low stock</span><strong>{loading ? '—' : stats.lowStock}</strong><small>Five units or fewer</small></div>
          <div className="metric"><span>Prime picks</span><strong>{loading ? '—' : stats.featured}</strong><small>Featured products</small></div>
        </section>

        <div className="grid">
          <section className="panel" id="products">
            <div className="panel-head"><h2>Catalog snapshot</h2><span>{loading ? 'Loading' : `${products.length} products`}</span></div>
            {recent.length ? <div className="table">
              <div className="row head"><span>Product</span><span>Price</span><span>Stock</span><span>Status</span></div>
              {recent.map((p) => <div className="row" key={p._id}><span>{p.name}</span><span>£{p.price.toFixed(2)}</span><span>{p.stock}</span><span className={p.stock <= 5 ? 'pill low' : 'pill'}>{p.stock <= 5 ? 'Low stock' : 'Healthy'}</span></div>)}
            </div> : <div className="empty">No products are currently available through the API.</div>}
          </section>

          <section className="panel">
            <div className="panel-head"><h2>Quick operations</h2><span>Next modules</span></div>
            <div className="quick-actions">
              <a href="#products"><strong>Product management</strong><small>Catalog, pricing and visibility</small></a>
              <a href="#orders"><strong>Order control</strong><small>Status and fulfilment workflow</small></a>
              <a href="#inventory"><strong>Inventory</strong><small>Stock alerts and adjustments</small></a>
              <a href="#marketing"><strong>Coupons</strong><small>Offers and promotion rules</small></a>
            </div>
          </section>
        </div>

        <section className="panel ai" id="ai-insights">
          <div className="panel-head"><h2>AI operations layer</h2><span>Foundation ready</span></div>
          <p>The dashboard is structured so AI insights can sit beside real catalog, order and customer data. The next implementation layer will connect product recommendations, smart search, support, review summaries and admin analytics to live data rather than placeholder labels.</p>
        </section>
      </main>
    </div>
  );
}
