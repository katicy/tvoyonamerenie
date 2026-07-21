'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password || !nickname) {
      setError('Заполни все поля');
      return;
    }
    if (password.length < 8 || !/[a-zA-Zа-яА-Я]/.test(password) || !/[0-9]/.test(password)) {
      setError('Пароль должен быть не короче 8 символов и содержать буквы и цифры');
      return;
    }
    setLoading(true);

    const { data: existing } = await supabase.from('profiles').select('id').eq('nickname', nickname.trim()).maybeSingle();
    if (existing) {
      setError('Это имя уже занято, выбери другое');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: nickname.trim() } },
    });
    if (signUpError) {
      setError(signUpError.message.includes('Database error') ? 'Это имя уже занято, выбери другое' : signUpError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push('/');
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Создать аккаунт</h2>
      <form onSubmit={handleSubmit}>
        <input className="field" type="text" placeholder="Имя (как будут видеть другие)" value={nickname} onChange={e => setNickname(e.target.value)} />
        <input className="field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="field" type="password" placeholder="Пароль (минимум 8 символов, буквы и цифры)" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="error-text">{error}</p>}
        <button className="btn-brass" type="submit" disabled={loading}>{loading ? 'Создаём...' : 'Зарегистрироваться'}</button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Уже есть аккаунт? <Link href="/login" style={{ color: 'var(--brass-dim)' }}>Войти</Link>
      </p>
    </div>
  );
}
