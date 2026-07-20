'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const AFFIRMATIONS = [
  'Я разрешаю себе получать столько же, сколько отдаю миру.',
  'Моя жизнь наполняется тем, на чём я искренне сосредоточен(а).',
  'Я легко привлекаю возможности, которые мне нужны.',
  'Каждый день я на шаг ближе к своей цели.',
  'Я доверяю процессу и своему времени.',
  'Изобилие — моё естественное состояние.',
  'Я достоин(на) любви, покоя и успеха.',
];

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function dayOfYear() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export default function JournalPage() {
  const [user, setUser] = useState(undefined); // undefined = ещё не проверено
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadEntries(data.user.id);
      else setLoading(false);
    });
  }, []);

  async function loadEntries(userId) {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false });
    setEntries(data || []);
    const today = data?.find(e => e.entry_date === todayISO());
    if (today) setText(today.text);
    setLoading(false);
  }

  function computeStreak() {
    if (entries.length === 0) return 0;
    const dates = new Set(entries.map(e => e.entry_date));
    let streak = 0;
    let cursor = new Date();
    if (!dates.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const key = cursor.getFullYear() + '-' + String(cursor.getMonth() + 1).padStart(2, '0') + '-' + String(cursor.getDate()).padStart(2, '0');
      if (dates.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1); } else break;
    }
    return streak;
  }

  async function handleSave() {
    if (!text.trim() || !user) return;
    const key = todayISO();
    await supabase.from('journal_entries').upsert({ user_id: user.id, entry_date: key, text: text.trim() }, { onConflict: 'user_id,entry_date' });
    setSaved(true);
    loadEntries(user.id);
    setTimeout(() => setSaved(false), 2000);
  }

  if (user === undefined || loading) return <div className="container"><p className="count">Загружаю...</p></div>;

  if (!user) {
    return (
      <div className="container">
        <h2>Дневник</h2>
        <p style={{ fontSize: 14 }}>Дневник — личный раздел, доступен только после входа.</p>
        <Link href="/signup"><button className="btn-brass">Зарегистрироваться</button></Link>
      </div>
    );
  }

  const affirmation = AFFIRMATIONS[dayOfYear() % AFFIRMATIONS.length];
  const streak = computeStreak();

  return (
    <div className="container">
      <div className="section-head">
        <h2>Мой дневник</h2>
        <span className="count">Серия · {streak} дн.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        <div>
          <div style={{ background: 'var(--ink)', color: 'var(--paper-dim)', borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sage)', marginBottom: 10 }}>Аффирмация дня</div>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: 19, lineHeight: 1.4, margin: 0 }}>«{affirmation}»</p>
          </div>
          <div className="card">
            <label className="mono" style={{ fontSize: 11, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 8 }}>Запись за сегодня</label>
            <textarea className="field" style={{ minHeight: 100 }} placeholder="Что я почувствовал(а) сегодня, приближаясь к своей цели?" value={text} onChange={e => setText(e.target.value)} />
            <button className="btn-brass" onClick={handleSave}>Сохранить запись</button>
            {saved && <div style={{ fontSize: 11, color: 'var(--sage)', marginTop: 8 }}>Сохранено ✓</div>}
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: 32, margin: 0 }}>{streak}</p>
            <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.55)', margin: '4px 0 0' }}>дней подряд ведёшь дневник</p>
          </div>
          <div className="card">
            <label className="mono" style={{ fontSize: 11, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 8 }}>Последние записи</label>
            {entries.length === 0 && <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.45)' }}>Записей пока нет.</p>}
            {entries.slice(0, 5).map(e => (
              <div key={e.id} style={{ borderBottom: '1px solid var(--line-dark)', padding: '10px 0', fontSize: 12 }}>
                <div className="mono" style={{ color: 'rgba(22,33,28,0.5)', fontSize: 10, marginBottom: 4 }}>{e.entry_date}</div>
                {e.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
