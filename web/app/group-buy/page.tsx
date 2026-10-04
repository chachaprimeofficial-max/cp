'use client';

import { useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../../lib/auth';

type Member={userId:string;amount:number;paymentStatus:string;joinedAt?:string};
type Group={groupNumber:string;productId:string;productName:string;targetAmount:number;contributionAmount:number;targetMembers:number;members:Member[];status:string;expiresAt:string};

const API_URL=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';

async function request(path:string,token:string,options:RequestInit={}) {
  const response=await fetch(API_URL+'/api/v1'+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...(options.headers||{})}});
  const data=await response.json();
  if(!response.ok) throw new Error(data.message||'Request failed');
  return data;
}

export default function GroupBuyingPage(){
  const [groups,setGroups]=useState<Group[]>([]);
  const [mine,setMine]=useState<Group[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [joining,setJoining]=useState('');
  const [token,setToken]=useState('');

  const load=async(t:string)=>{
    const [open,owned]=await Promise.all([request('/group-buy/open',t),request('/group-buy/mine',t)]);
    setGroups(open); setMine(owned);
  };

  useEffect(()=>{
    const t=localStorage.getItem(TOKEN_KEY)||'';
    setToken(t);
    if(!t){setLoading(false);return;}
    load(t).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const join=async(groupNumber:string)=>{
    if(!token)return;
    setJoining(groupNumber);setError('');
    try{await request('/group-buy/'+encodeURIComponent(groupNumber)+'/join',token,{method:'POST'});await load(token);}
    catch(e){setError(e instanceof Error?e.message:'Unable to join group');}
    finally{setJoining('');}
  };

  const card=(group:Group)=>{
    const raised=group.members.reduce((sum,m)=>sum+m.amount,0);
    const percent=Math.min(100,Math.round((raised/group.targetAmount)*100));
    const members=group.members.length;
    const already=group.members.some(m=>mine.some(g=>g.groupNumber===group.groupNumber)&&m.userId);
    return <article className="group-card" key={group.groupNumber}>
      <div className="group-card-top"><span>GROUP BUY</span><small>{group.status}</small></div>
      <h2>{group.productName}</h2>
      <p>Save together with other Chacha Prime customers. Your contribution is charged immediately from your Chacha Wallet.</p>
      <div className="group-progress"><div style={{width:percent+'%'}}/></div>
      <div className="group-stats"><span>£{raised.toFixed(2)} / £{group.targetAmount.toFixed(2)}</span><span>{members} / {group.targetMembers} members</span></div>
      <div className="group-meta"><strong>Contribution £{group.contributionAmount.toFixed(2)}</strong><small>Ends {new Date(group.expiresAt).toLocaleString()}</small></div>
      <button className="primary group-join" disabled={joining===group.groupNumber||group.status!=='open'||already} onClick={()=>join(group.groupNumber)}>
        {joining===group.groupNumber?'Joining…':already?'Joined':'Join group'}
      </button>
    </article>;
  };

  const uniqueMine=useMemo(()=>mine.slice(0,20),[mine]);

  if(!token)return <main className="shell"><section className="account-page"><div className="orders-card"><h1>Group Buying</h1><p>Please sign in to join a group purchase.</p><a className="primary" href="/login">Sign in</a></div></section></main>;

  return <main className="shell"><header><img src="/logo.svg" alt="Chacha Prime"/><nav><a href="/shop">Shop</a><a href="/group-buy">Group Buying</a><a href="/account">Account</a></nav></header>
    <section className="group-hero"><span className="eyebrow">BUY TOGETHER</span><h1>More people.<br/><em>Better value.</em></h1><p>Join a group, contribute from your Chacha Wallet, and unlock the group target together.</p></section>
    {error&&<div className="notice error">{error}</div>}
    {loading?<div className="orders-card">Loading group buys…</div>:<section className="group-grid">{groups.length?groups.map(card):<div className="orders-card"><h2>No open groups yet</h2><p>New group-buy opportunities will appear here.</p></div>}</section>}
    <section className="group-history"><div className="section-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>My Group Buys</h2></div><a href="/account">Wallet & account</a></div>
      {uniqueMine.length?<div className="group-history-list">{uniqueMine.map(g=><div className="group-history-row" key={g.groupNumber}><div><strong>{g.productName}</strong><small>{g.groupNumber}</small></div><span>{g.status}</span><b>£{g.contributionAmount.toFixed(2)}</b></div>)}</div>:<div className="orders-card">You have not joined a group buy yet.</div>}
    </section>
  </main>;
}
