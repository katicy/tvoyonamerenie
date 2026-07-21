'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Восстановление пароля</h2>
      {sent ? (
        <p style={{ fontSize: 14 }}>Письмо со ссылкой отправлено на {email}. Проверь почту (и папку «Спам»).</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input className="field" type="email" placeholder="Твой email" value={email} onChange={e => setEmail(e.target.value)} />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-brass" type="submit">Отправить ссылку</button>
        </form>
      )}
      <p style={{ fontSize: 13, marginTop: 16 }}>
        <Link href="/login" style={{ color: 'var(--brass-dim)' }}>← Вернуться ко входу</Link>
      </p>
    </div>
  );
}
