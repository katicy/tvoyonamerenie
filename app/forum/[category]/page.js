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

export default function CategoryPage({ params }) {
  const cat = CATEGORIES.find(c => c.key === params.category);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTopics();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
          .then(({ data: profile }) => setIsAdmin(!!profile?.is_admin));
      }
    });
  }, []);

  async function loadTopics() {
    setLoading(true);
    const { data } = await supabase
      .from('forum_topics')
      .select('*, forum_replies(count)')
      .eq('category', params.category)
      .order('created_at', { ascending: false });
    setTopics(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (!user) { router.push('/signup'); return; }
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
    const { data: topic } = await supabase.from('forum_topics').insert({
      category: params.category,
      title: title.trim(),
      user_id: user.id,
      author_name: profile?.nickname || 'Аноним',
    }).select().single();
    if (topic) {
      await supabase.from('forum_replies').insert({
        topic_id: topic.id,
        user_id: user.id,
        author_name: profile?.nickname || 'Аноним',
        text: body.trim(),
      });
      router.push(`/forum/${params.category}/${topic.id}`);
    }
  }

  async function handleDeleteTopic(topicId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Удалить эту тему вместе со всеми ответами?')) return;
    await supabase.from('forum_replies').delete().eq('topic_id', topicId);
    await supabase.from('forum_topics').delete().eq('id', topicId);
    setTopics(topics.filter(t => t.id !== topicId));
  }

  if (!cat) return <div className="container">Раздел не найден</div>;

  return (
    <div className="container">
      <Link href="/forum" className="mono" style={{ color: 'var(--brass-dim)', fontSize: 12 }}>← все разделы</Link>
      <div className="section-head" style={{ marginTop: 16 }}>
        <h2>{cat.name}</h2>
        <span className="count">{topics.length} тем</span>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <form onSubmit={handleCreate}>
          <input className="field" placeholder="Заголовок темы" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="field" placeholder="Твоё сообщение..." style={{ minHeight: 70, resize: 'vertical' }} value={body} onChange={e => setBody(e.target.value)} />
          <button className="btn-brass" type="submit">Создать тему</button>
        </form>
      </div>

      {loading ? (
        <p className="count">Загружаю темы...</p>
      ) : topics.length === 0 ? (
        <p className="count">Пока тем нет — начни первым.</p>
      ) : (
        topics.map(t => (
          <Link href={`/forum/${params.category}/${t.id}`} key={t.id}>
            <div style={{ padding: '14px 4px', borderBottom: '1px solid var(--line-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{t.title}</p>
                <div style={{ fontSize: 11, color: 'rgba(22,33,28,0.5)' }}>
                  {t.author_name} · {timeAgo(t.created_at)} · {t.forum_replies?.[0]?.count || 0} ответов
                </div>
              </div>
              {isAdmin && (
                <button onClick={(e) => handleDeleteTopic(t.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(22,33,28,0.35)' }} title="Удалить (админ)">✕</button>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
