'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PublicProfilePage({ params }) {
  const [nickname, setNickname] = useState('');
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', params.userId).single();
      setNickname(profile?.nickname || 'Аноним');
      const { data: userWishes } = await supabase.from('wishes').select('*').eq('user_id', params.userId).order('created_at', { ascending: false });
      setWishes(userWishes || []);
      setLoading(false);
    }
    load();
  }, [params.userId]);

  if (loading) return <div className="container"><p className="count">Загружаю...</p></div>;

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div style={{ background: 'var(--ink)', color: 'var(--paper-dim)', borderRadius: 8, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--brass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 16, color: 'var(--ink)' }}>
          {nickname.charAt(0).toUpperCase()}
        </div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{nickname}</p>
      </div>

      <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(22,33,28,0.6)', margin: '0 0 8px' }}>Опубликованные намерения</p>
      {wishes.length === 0 && <p style={{ fontSize: 13, color: 'rgba(22,33,28,0.45)' }}>Пока ничего не опубликовано.</p>}
      {wishes.map(w => (
        <div className="card" key={w.id} style={{ marginBottom: 8 }}>
          <span className="tag">{w.tag}</span>
          <p style={{ fontSize: 13, margin: 0 }}>{w.text}</p>
        </div>
      ))}
    </div>
  );
}
