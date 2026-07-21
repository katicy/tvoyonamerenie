'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const TAGS = ['карьера', 'здоровье', 'отношения', 'деньги', 'саморазвитие'];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return min <= 1 ? 'только что' : min + ' мин назад';
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return hrs + ' ч назад';
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'вчера' : days + ' дн назад';
}

export default function HomePage() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const [supportedIds, setSupportedIds] = useState(new Set());
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadWishes();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadSupports(data.user.id);
    });
  }, []);

  async function loadWishes() {
    setLoading(true);
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setWishes(data || []);
    setLoading(false);
  }

  async function loadSupports(userId) {
    const { data } = await supabase.from('wish_supports').select('wish_id').eq('user_id', userId);
    setSupportedIds(new Set((data || []).map(r => r.wish_id)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      window.location.href = '/signup';
      return;
    }
    setPosting(true);
    const tag = TAGS[Math.floor(Math.random() * TAGS.length)];
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
    await supabase.from('wishes').insert({
      user_id: user.id,
      author_name: profile?.nickname || 'Аноним',
      text: text.trim(),
      tag,
    });
    setText('');
    setPosting(false);
    loadWishes();
  }

  async function handleSupport(wishId, currentCount) {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (supportedIds.has(wishId)) return;
    await supabase.from('wish_supports').insert({ wish_id: wishId, user_id: user.id });
    await supabase.from('wishes').update({ support_count: currentCount + 1 }).eq('id', wishId);
    setSupportedIds(new Set([...supportedIds, wishId]));
    setWishes(wishes.map(w => (w.id === wishId ? { ...w, support_count: currentCount + 1 } : w)));
  }

  return (
    <div>
      <div style={{ background: 'var(--ink)', color: 'var(--paper-dim)', padding: '56px 32px 44px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--sage)', marginBottom: 14 }}>
            Практика манифестации · сообщество
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.18, margin: '0 0 14px' }}>
            Намерение, записанное словами,<br />становится реальностью.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(237,230,211,0.7)', maxWidth: 480, margin: '0 auto 28px' }}>
            Формулируй желания, веди дневник визуализаций, читай практики других — и наблюдай, как мысль оформляется в реальность.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 520, margin: '0 auto' }}>
            <input
              className="field"
              style={{ margin: 0, background: 'rgba(246,241,227,0.08)', color: 'var(--paper-dim)', border: '1px solid var(--line)' }}
              placeholder="Напиши своё намерение..."
              maxLength={140}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button className="btn-brass" type="submit" disabled={posting}>Отпустить</button>
          </form>
          {!user && <p style={{ fontSize: 12, marginTop: 12, opacity: 0.6 }}>Нужна регистрация, чтобы опубликовать намерение</p>}
        </div>
      </div>

      <div className="container">
        <div className="section-head">
          <h2>Лента намерений</h2>
          <span className="count">{wishes.length} намерений</span>
        </div>
        {loading ? (
          <p className="count">Загружаю ленту...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {wishes.map(w => (
              <div className="card" key={w.id}>
                <span className="tag">{w.tag}</span>
                <p style={{ fontSize: 14, margin: '0 0 14px' }}>{w.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(22,33,28,0.5)' }}>
                  <span>{w.author_name} · {timeAgo(w.created_at)}</span>
                  <button
                    onClick={() => handleSupport(w.id, w.support_count)}
                    className="mono"
                    style={{
                      background: 'none', border: '1px solid var(--line-dark)', color: 'var(--brass-dim)',
                      fontSize: 11, padding: '4px 9px', borderRadius: 20, cursor: 'pointer',
                    }}
                  >
                    ↑ {w.support_count} поддержали
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
