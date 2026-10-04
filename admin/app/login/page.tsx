'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-card">
        <img src="/logo.svg" alt="Chacha Prime" className="admin-auth-logo" />
        <span className="eyebrow">SECURE ADMIN ACCESS</span>
        <h1>Command center.</h1>
        <p>Sign in with an administrator account to manage Chacha Prime operations.</p>

        {error && <div className="notice error">{error}</div>}

        <form onSubmit={submit} className="admin-auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" />
          </label>
          <button className="button primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in securely'}
          </button>
        </form>
      </div>
    </main>
  );
}