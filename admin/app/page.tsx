'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, getAdminMe, TOKEN_KEY } from '../lib/auth';

type Product = { _id:string; name:string; slug:string; price:number; compareAtPrice?:number; stock:number; featured?:boolean; isActive?:boolean; description?:string; images?:string[] };
type Order = { _id:string; orderNumber:string; userId:string; total:number; status:string; paymentStatus:string; createdAt?:string; items?:{name:string;quantity:number}[] };
type GroupBuy = { _id:string; groupNumber:string; productName:string; targetAmount:number; contributionAmount:number; targetMembers:number; members:{userId:string;amount:number;paymentStatus:string}[]; status:string; expiresAt:string };
type Refund = { _id:string; refundNumber:string; orderNumber:string; userId:string; amount:number; reason:string; status:string; refundMethod:string; adminNote?:string; createdAt?:string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function api(path:string, options:RequestInit={}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type','application/json');
  if (token) headers.set('Authorization',`Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, {...options, headers});
  if (!res.ok) throw new Error(await res.text() || 'Request failed');
  return res.json();
}

export default function Admin() {
  const router = useRouter();
  const [authChecking,setAuthChecking]=useState(true);
  const [adminName,setAdminName]=useState('');
  const [products,setProducts]=useState<Product[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [refunds,setRefunds]=useState<Refund[]>([]);
  const [groupBuys,setGroupBuys]=useState<GroupBuy[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const [editing,setEditing]=useState<Product|null>(null);
  const [form,setForm]=useState({name:'',slug:'',price:'',stock:'',description:'',featured:false});

  const load=async()=>{
    setLoading(true);
    try {
      const [p,o,r]=await Promise.all([api('/api/v1/products?limit=60'),api('/api/v1/orders/admin/list'),api('/api/v1/refunds/admin/list'),api('/api/v1/group-buy/admin/list')]);
      setProducts(p.items||[]); setOrders(o||[]); setRefunds(r||[]); setGroupBuys(arguments[0]||[]);
      setMessage('');
    } catch(e){ setMessage(e instanceof Error ? e.message : 'Unable to load admin data.'); }
    finally{setLoading(false);}
  };
  useEffect(()=>{
    let active=true;
    const verify=async()=>{
      const token=localStorage.getItem(TOKEN_KEY);
      if(!token){router.replace('/login');return;}
      const user=await getAdminMe(token);
      if(!active)return;
      if(!user){adminLogout();router.replace('/login');return;}
      setAdminName(user.name);
      setAuthChecking(false);
      load();
    };
    verify().catch(()=>{if(active){adminLogout();router.replace('/login');}});
    return()=>{active=false;};
  },[]);

  const stats=useMemo(()=>({
    products:products.length,
    active:products.filter(p=>p.isActive!==false).length,
    low:products.filter(p=>p.stock<=5).length,
    orders:orders.length
  }),[products,orders]);

  function startCreate(){
    setEditing(null); setForm({name:'',slug:'',price:'',stock:'',description:'',featured:false});
    document.getElementById('product-form')?.scrollIntoView({behavior:'smooth'});
  }
  function startEdit(p:Product){
    setEditing(p); setForm({name:p.name,slug:p.slug,price:String(p.price),stock:String(p.stock),description:p.description||'',featured:!!p.featured});
    document.getElementById('product-form')?.scrollIntoView({behavior:'smooth'});
  }
  async function save(e:FormEvent){
    e.preventDefault(); setMessage('Saving...');
    try{
      const body={name:form.name,slug:form.slug,price:Number(form.price),stock:Number(form.stock),description:form.description,featured:form.featured,isActive:true};
      await api(editing?`/api/v1/products/${editing._id}`:'/api/v1/products',{method:editing?'PATCH':'POST',body:JSON.stringify(body)});
      setMessage('Product saved successfully.'); await load();
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to save product.');}
  }
  async function archive(id:string){
    if(!confirm('Archive this product?')) return;
    try{await api(`/api/v1/products/${id}`,{method:'DELETE'});setMessage('Product archived.');await load();}
    catch(e){setMessage(e instanceof Error?e.message:'Unable to archive product.');}
  }
  async function refundAction(refundNumber:string,action:'approve'|'reject'|'complete'){
    try{await api(`/api/v1/refunds/admin/${encodeURIComponent(refundNumber)}/${action}`,{method:'POST',body:JSON.stringify({})});setMessage(`Refund ${refundNumber} ${action}d.`);await load();}
    catch(e){setMessage(e instanceof Error?e.message:'Unable to update refund.');}
  }
  async function status(orderNumber:string,status:string){
    try{await api(`/api/v1/orders/admin/${encodeURIComponent(orderNumber)}/status`,{method:'PATCH',body:JSON.stringify({status})});setMessage(`Order ${orderNumber} updated.`);await load();}
    catch(e){setMessage(e instanceof Error?e.message:'Unable to update order.');}
  }

  if (authChecking) return <main className="admin-auth-page"><div className="admin-auth-card"><img src="/logo.svg" alt="Chacha Prime" className="admin-auth-logo"/><span className="eyebrow">SECURE ADMIN ACCESS</span><h1>Verifying access.</h1><p>Checking administrator credentials...</p></div></main>;

  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="brand"><img src="/logo.svg" alt="Chacha Prime"/><div><strong>CHACHA PRIME</strong><small>ADMIN CONSOLE</small></div></div>
      <nav className="nav"><a className="active" href="#overview">Overview</a><a href="#products">Products</a><a href="#orders">Orders</a><a href="#refunds">Refunds</a><a href="#inventory">Inventory</a><a href="#ai-insights">AI Insights</a></nav>
      <div className="sidebar-footer">Single-vendor commerce operations.<br/>Built for Chacha Prime.</div>
    </aside>

    <main className="main" id="overview">
      <div className="topbar"><div><span className="eyebrow">COMMAND CENTER</span><h1>Operations overview</h1><div className="muted">Manage your live catalog and fulfilment workflow.</div></div><div className="top-actions"><span className="status">LIVE CONTROL</span><span className="admin-user">{adminName}</span><button className="button ghost" onClick={()=>{adminLogout();router.replace('/login');}}>Sign out</button></div></div>
      {message && <div className="notice">{message}</div>}
      <section className="metrics">
        <div className="metric"><span>Total products</span><strong>{loading?'—':stats.products}</strong><small>Catalog records</small></div>
        <div className="metric"><span>Active catalog</span><strong>{loading?'—':stats.active}</strong><small>Customer-visible</small></div>
        <div className="metric"><span>Low stock</span><strong>{loading?'—':stats.low}</strong><small>Five units or fewer</small></div>
        <div className="metric"><span>Orders</span><strong>{loading?'—':stats.orders}</strong><small>Latest 100</small></div>
      </section>

      <section className="panel" id="product-form">
        <div className="panel-head"><h2>{editing?'Edit product':'Create product'}</h2><button className="button ghost" onClick={startCreate}>New product</button></div>
        <form className="product-form" onSubmit={save}>
          <input required placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input required placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/>
          <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
          <input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Prime pick</label>
          <button className="button primary-btn" type="submit">{editing?'Save changes':'Create product'}</button>
        </form>
      </section>

      <section className="panel" id="products">
        <div className="panel-head"><h2>Product management</h2><span>{products.length} products</span></div>
        <div className="table product-table"><div className="row head"><span>Product</span><span>Price</span><span>Stock</span><span>Actions</span></div>
          {products.map(p=><div className="row" key={p._id}><span><strong>{p.name}</strong>{p.featured&&<small className="sub">Prime pick</small>}</span><span>£{p.price.toFixed(2)}</span><span className={p.stock<=5?'low-text':''}>{p.stock}</span><span className="actions-cell"><button onClick={()=>startEdit(p)}>Edit</button><button onClick={()=>archive(p._id)}>Archive</button></span></div>)}
          {!products.length&&!loading&&<div className="empty">No products found.</div>}
        </div>
      </section>

      <section className="panel" id="orders">
        <div className="panel-head"><h2>Order management</h2><span>{orders.length} latest orders</span></div>
        <div className="table order-table"><div className="row order-row head"><span>Order</span><span>Total</span><span>Payment</span><span>Status</span></div>
          {orders.map(o=><div className="row order-row" key={o._id}><span><strong>{o.orderNumber}</strong><small className="sub">{o.items?.length||0} line items</small></span><span>£{o.total.toFixed(2)}</span><span><span className="pill">{o.paymentStatus}</span></span><span><select value={o.status} onChange={e=>status(o.orderNumber,e.target.value)}><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></span></div>)}
          {!orders.length&&!loading&&<div className="empty">No orders found or administrator authentication is required.</div>}
        </div>
      </section>

      <section className="panel" id="refunds"><div className="panel-head"><h2>Refund management</h2><span>{refunds.length} latest requests</span></div><div className="table order-table"><div className="row head"><span>Refund</span><span>Amount</span><span>Status</span><span>Actions</span></div>{refunds.map(r=><div className="row" key={r._id}><span><strong>{r.refundNumber}</strong><small className="sub">{r.orderNumber} · {r.reason}</small></span><span>£{r.amount.toFixed(2)}</span><span><span className="pill">{r.status}</span></span><span className="actions-cell">{r.status==='requested'&&<><button onClick={()=>refundAction(r.refundNumber,'approve')}>Approve</button><button onClick={()=>refundAction(r.refundNumber,'reject')}>Reject</button></>}{r.status==='approved'&&<button onClick={()=>refundAction(r.refundNumber,'complete')}>Refund to wallet</button>}</span></div>)}{!refunds.length&&!loading&&<div className="empty">No refund requests found.</div>}</div></section>

      <section className="panel ai" id="ai-insights"><div className="panel-head"><h2>AI operations layer</h2><span>Next intelligence pass</span></div><p>Live catalog and order data are now available to the admin control layer. The next stage can safely add smart search, recommendations, customer support, review summaries and operational insights on top of these records.</p></section>
    </main>
  </div>;
}
