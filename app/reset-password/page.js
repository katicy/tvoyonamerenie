'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function isStrongPassword(pw) {
  return pw.length >= 8 && /[a-zA-Zа-яА-Я]/.test(pw) && /[0-9]/.test(pw);
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isStrongPassword(password)) {
      setError('Пароль должен быть не короче 8 символов и содержать буквы и цифры');
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push('/'), 2000);
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Новый пароль</h2>
      {done ? (
        <p style={{ fontSize: 14 }}>Пароль обновлён. Переносим тебя на главную...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input className="field" type="password" placeholder="Новый пароль" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-brass" type="submit">Сохранить пароль</button>
        </form>
      )}
    </div>
  );
}
