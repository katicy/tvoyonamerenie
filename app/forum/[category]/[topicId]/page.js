'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
          .then(({ data: profile }) => setIsAdmin(!!profile?.is_admin));
      }
    });
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

  async function handleDeleteReply(replyId) {
    if (!confirm('Удалить этот ответ?')) return;
    await supabase.from('forum_replies').delete().eq('id', replyId);
    setReplies(replies.filter(r => r.id !== replyId));
  }

  async function handleDeleteTopic() {
    if (!confirm('Удалить всю тему вместе с ответами?')) return;
    await supabase.from('forum_replies').delete().eq('topic_id', params.topicId);
    await supabase.from('forum_topics').delete().eq('id', params.topicId);
    router.push(`/forum/${params.category}`);
  }

  if (loading) return <div className="container"><p className="count">Загружаю тему...</p></div>;
  if (!topic) return <div className="container">Тема не найдена</div>;

  return (
    <div className="container">
      <Link href={`/forum/${params.category}`} className="mono" style={{ color: 'var(--brass-dim)', fontSize: 12 }}>← {cat?.name}</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
        <div>
          <h2 style={{ fontSize: 19, margin: '0 0 6px' }}>{topic.title}</h2>
          <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', marginBottom: 20 }}>{topic.author_name} · {timeAgo(topic.created_at)}</p>
        </div>
        {isAdmin && (
          <button onClick={handleDeleteTopic} className="btn-ghost" style={{ fontSize: 12 }}>Удалить тему</button>
        )}
      </div>

      {replies.map(r => (
        <div className="card" key={r.id} style={{ marginBottom: 10, position: 'relative' }}>
          {isAdmin && (
            <button onClick={() => handleDeleteReply(r.id)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(22,33,28,0.35)' }} title="Удалить (админ)">✕</button>
          )}
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
