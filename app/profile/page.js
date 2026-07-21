'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [user, setUser] = useState(undefined);
  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [wishes, setWishes] = useState([]);
  const [topicsCount, setTopicsCount] = useState(0);
  const [saveMsg, setSaveMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadAll(data.user.id);
    });
  }, []);

  async function loadAll(userId) {
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', userId).single();
    setNickname(profile?.nickname || 'Аноним');
    setNewNickname(profile?.nickname || '');

    const { data: myWishes } = await supabase.from('wishes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setWishes(myWishes || []);

    const { count } = await supabase.from('forum_topics').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    setTopicsCount(count || 0);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaveMsg('');
    if (newNickname.trim() && newNickname !== nickname) {
      await supabase.from('profiles').upsert({ id: user.id, nickname: newNickname.trim() });
      setNickname(newNickname.trim());
    }
    if (newPassword.trim()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) { setSaveMsg('Ошибка: ' + error.message); return; }
      setNewPassword('');
    }
    setSaveMsg('Сохранено ✓');
  }

  if (user === undefined) return <div className="container"><p className="count">Загружаю...</p></div>;
  if (!user) { router.push('/login'); return null; }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div style={{ background: 'var(--ink)', color: 'var(--paper-dim)', borderRadius: 8, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--brass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 16, color: 'var(--ink)' }}>
          {nickname.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{nickname}</p>
          <p style={{ fontSize: 12, color: 'var(--sage)', margin: '2px 0 0' }}>Только ты видишь эту страницу целиком</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{wishes.length}</p>
          <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.55)', margin: '2px 0 0' }}>намерений</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{topicsCount}</p>
          <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.55)', margin: '2px 0 0' }}>темы форума</p>
        </div>
      </div>

      <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(22,33,28,0.6)', margin: '0 0 8px' }}>Мои намерения</p>
      {wishes.length === 0 && <p style={{ fontSize: 13, color: 'rgba(22,33,28,0.45)' }}>Пока ничего не опубликовано.</p>}
      {wishes.map(w => (
        <div className="card" key={w.id} style={{ marginBottom: 8 }}>
          <span className="tag">{w.tag}</span>
          <p style={{ fontSize: 13, margin: 0 }}>{w.text}</p>
        </div>
      ))}

      <Link href="/journal">
        <button className="btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0' }}>
          Перейти в дневник <span>→</span>
        </button>
      </Link>

      <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(22,33,28,0.6)', margin: '0 0 8px' }}>Настройки</p>
      <div className="card">
        <form onSubmit={handleSaveSettings}>
          <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Имя</label>
          <input className="field" value={newNickname} onChange={e => setNewNickname(e.target.value)} />
          <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Новый пароль</label>
          <input className="field" type="password" placeholder="Оставь пустым, если не меняешь" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <button className="btn-brass" type="submit">Сохранить изменения</button>
          {saveMsg && <p style={{ fontSize: 12, color: 'var(--sage)', marginTop: 8 }}>{saveMsg}</p>}
        </form>
        <button className="btn-ghost" style={{ width: '100%', marginTop: 12 }} onClick={handleLogout}>Выйти из аккаунта</button>
      </div>
    </div>
  );
}
