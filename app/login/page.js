'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError('Неверный email или пароль');
      return;
    }
    router.push('/');
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input className="field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="field" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="error-text">{error}</p>}
        <button className="btn-brass" type="submit" disabled={loading}>{loading ? 'Входим...' : 'Войти'}</button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Ещё нет аккаунта? <Link href="/signup" style={{ color: 'var(--brass-dim)' }}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}
