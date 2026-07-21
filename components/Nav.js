'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadNickname(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadNickname(session.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadNickname(userId) {
    const { data } = await supabase.from('profiles').select('nickname').eq('id', userId).single();
    setNickname(data?.nickname || 'Аккаунт');
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
          <Link href="/profile"><button className="btn-ghost">{nickname}</button></Link>
        ) : (
          <Link href="/login"><button className="btn-ghost">Войти</button></Link>
        )}
      </div>
    </div>
  );
}
