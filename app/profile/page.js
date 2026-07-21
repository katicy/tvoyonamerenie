'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [user, setUser] = useState(undefined);
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('nickname').eq('id', data.user.id).single()
          .then(({ data: profile }) => setNickname(profile?.nickname || 'Аноним'));
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (user === undefined) return <div className="container"><p className="count">Загружаю...</p></div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Профиль</h2>
      <div className="card" style={{ marginTop: 16 }}>
        <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', margin: '0 0 4px' }} className="mono">Имя</p>
        <p style={{ fontSize: 18, margin: '0 0 20px' }}>{nickname}</p>
        <button className="btn-ghost" onClick={handleLogout}>Выйти из аккаунта</button>
      </div>
    </div>
  );
}
