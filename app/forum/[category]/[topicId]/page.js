'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORIES } from '@/lib/categories';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'только что';
  if (hrs < 24) return hrs + ' ч назад';
  return Math.floor(hrs / 24) + ' дн назад';
}

export default function TopicPage({ params }) {
  const cat = CATEGORIES.find(c => c.key === params.category);
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function load() {
    setLoading(true);
    const { data: t } = await supabase.from('forum_topics').select('*').eq('id', params.topicId).single();
    const { data: r } = await supabase.from('forum_replies').select('*').eq('topic_id', params.topicId).order('created_at', { ascending: true });
    setTopic(t);
    setReplies(r || []);
    setLoading(false);
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    if (!user) { window.location.href = '/login'; return; }
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
    await supabase.from('forum_replies').insert({
      topic_id: params.topicId,
      user_id: user.id,
      author_name: profile?.nickname || 'Аноним',
      text: reply.trim(),
    });
    setReply('');
    load();
  }

  if (loading) return <div className="container"><p className="count">Загружаю тему...</p></div>;
  if (!topic) return <div className="container">Тема не найдена</div>;

  return (
    <div className="container">
      <Link href={`/forum/${params.category}`} className="mono" style={{ color: 'var(--brass-dim)', fontSize: 12 }}>← {cat?.name}</Link>
      <h2 style={{ fontSize: 19, margin: '16px 0 6px' }}>{topic.title}</h2>
      <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', marginBottom: 20 }}>{topic.author_name} · {timeAgo(topic.created_at)}</p>

      {replies.map(r => (
        <div className="card" key={r.id} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            {r.author_name} <span className="mono" style={{ fontWeight: 400, color: 'rgba(22,33,28,0.45)' }}>· {timeAgo(r.created_at)}</span>
          </div>
          <p style={{ fontSize: 13, margin: 0 }}>{r.text}</p>
        </div>
      ))}

      <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <textarea className="field" style={{ minHeight: 44, resize: 'vertical', margin: 0 }} placeholder="Написать ответ..." value={reply} onChange={e => setReply(e.target.value)} />
        <button className="btn-brass" type="submit">Ответить</button>
      </form>
    </div>
  );
}
