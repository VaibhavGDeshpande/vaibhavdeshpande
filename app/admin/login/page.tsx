'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <div className="a-login">
      <div className="a-login__side">
        <p>Vaibhav, photography archive</p>
        <h1>A home for the work behind the images.</h1>
        <p>Portfolio administration</p>
      </div>

      <form
        className="a-login__form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <h2>Sign in</h2>
          <p className="a-help">Continue to your photography archive.</p>
        </div>

        {error && (
          <p role="alert" className="a-status a-status--error" style={{ marginBottom: 0 }}>
            {error}
          </p>
        )}

        <label className="a-field">
          <span className="a-label">Email address</span>
          <input
            type="email"
            name="email"
            className="a-input"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="a-field">
          <span className="a-label">Password</span>
          <input
            type="password"
            name="password"
            className="a-input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading} aria-busy={loading} className="a-btn a-btn--primary">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
