'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
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
          <button className="btn-ghost" onClick={handleLogout}>Выйти</button>
        ) : (
          <Link href="/login"><button className="btn-ghost">Войти</button></Link>
        )}
      </div>
    </div>
  );
}
