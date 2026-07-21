'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadProfile(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', userId).single();
    setNickname(data?.nickname || 'Аккаунт');
    setAvatarUrl(data?.avatar_url || '');
  }

  return (
    <div className="topbar">
      <Link href="/" className="logo">твоё намерение<span>.</span></Link>
      <div className="nav-links">
        <Link href="/">лента</Link>
        <Link href="/forum">форум</Link>
        <Link href="/articles">статьи</Link>
        <Link href="/journal">дневник</Link>
        {user ? (
          <Link href="/profile">
            <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {avatarUrl && (
                <img src={avatarUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              {nickname}
            </button>
          </Link>
        ) : (
          <Link href="/login"><button className="btn-ghost">Войти</button></Link>
        )}
      </div>
    </div>
  );
}
