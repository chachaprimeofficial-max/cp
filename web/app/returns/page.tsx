'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { createRefundRequest, getMe, getMyOrders, getMyRefunds, TOKEN_KEY, User } from '../../lib/auth';

type Order = { orderNumber:string; total:number; status:string; paymentStatus:string; createdAt:string };
type Refund = { refundNumber:string; orderNumber:string; amount:number; reason:string; status:string; refundMethod:string; createdAt:string; completedAt?:string };

export default function ReturnsPage(){
  const [user,setUser]=useState<User|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [refunds,setRefunds]=useState<Refund[]>([]);
  const [selected,setSelected]=useState('');
  const [reason,setReason]=useState('');
  const [amount,setAmount]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');

  async function load(){
    const token=localStorage.getItem(TOKEN_KEY);
    if(!token){setLoading(false);return;}
    const me=await getMe(token);
    if(!me){setLoading(false);return;}
    setUser(me);
    const [o,r]=await Promise.all([getMyOrders(token),getMyRefunds(token)]);
    setOrders(o);setRefunds(r);setLoading(false);
  }

  useEffect(()=>{load().catch(()=>setLoading(false));},[]);

  const eligible=orders.filter(o=>o.status==='delivered' && (Date.now()-new Date(o.createdAt).getTime()) <= 7*86400000 && !refunds.some(r=>r.orderNumber===o.orderNumber && ['requested','approved','processing','completed'].includes(r.status)));

  async function submit(e:FormEvent){
    e.preventDefault();setMessage('');
    const token=localStorage.getItem(TOKEN_KEY);
    if(!token||!selected||!reason.trim())return;
    setSaving(true);
    try{
      const order=orders.find(o=>o.orderNumber===selected);
      await createRefundRequest(token,{orderNumber:selected,reason:reason.trim(),amount:amount?Number(amount):undefined});
      setMessage('Refund request submitted successfully.');
      setSelected('');setReason('');setAmount('');
      await load();
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to submit refund request.');}
    finally{setSaving(false);}
  }

  if(loading)return <main className="auth-page"><section className="auth-card"><p>Loading returns...</p></section></main>;
  if(!user)return <main className="auth-page"><section className="auth-card"><span className="eyebrow">RETURNS & REFUNDS</span><h1>Sign in to manage a return.</h1><Link href="/login" className="primary">Sign in</Link></section></main>;

  return <main className="account-page">
    <span className="eyebrow">RETURNS & REFUNDS</span>
    <h1>Manage your return.</h1>
    <p className="muted">Eligible delivered orders can be submitted within the 7-business-day return window. Approved refunds are credited to your Chacha Wallet.</p>

    <section className="account-grid">
      <section className="account-card"><span>RETURN POLICY</span><h2>7 business days</h2><p>Requests are reviewed before a refund is approved.</p></section>
      <section className="account-card"><span>REFUND METHOD</span><h2>Chacha Wallet</h2><p>Your eligible refund is credited securely to your wallet.</p></section>
    </section>

    <section className="orders-card">
      <span>NEW REQUEST</span><h2>Request a refund</h2>
      {message&&<p className="notice">{message}</p>}
      {eligible.length ? <form className="product-form" onSubmit={submit}>
        <select required value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="">Select delivered order</option>
          {eligible.map(o=><option key={o.orderNumber} value={o.orderNumber}>{o.orderNumber} — £{o.total.toFixed(2)}</option>)}
        </select>
        <input type="number" min="0.01" step="0.01" placeholder="Refund amount (optional)" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <textarea required placeholder="Reason for return/refund" value={reason} onChange={e=>setReason(e.target.value)}/>
        <button className="primary" disabled={saving}>{saving?'Submitting...':'Submit refund request'}</button>
      </form> : <p>No delivered orders are currently within the refund window.</p>}
    </section>

    <section className="orders-card">
      <span>REFUND HISTORY</span><h2>Your requests</h2>
      {refunds.length ? <div className="orders-list">{refunds.map(r=><div className="order-row" key={r.refundNumber}><div><strong>{r.refundNumber}</strong><small>{r.orderNumber} · {r.reason}</small></div><span>{r.status}</span><strong>£{r.amount.toFixed(2)}</strong></div>)}</div> : <p>No refund requests yet.</p>}
    </section>
  </main>;
}
