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

    router.push('/admin'); // 👈 redirect after login
    router.refresh();
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    alert('Account created. You can now log in.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-serif text-center">Admin Login</h1>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-neutral-900 border border-neutral-800 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-neutral-900 border border-neutral-800 text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-white text-black font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-3 border border-neutral-700 text-neutral-300 hover:text-white"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
