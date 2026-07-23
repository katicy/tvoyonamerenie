'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewArticlePage() {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [title, setTitle] = useState('');
  const [eyebrow, setEyebrow] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('nickname, is_admin').eq('id', data.user.id).single();
      if (!profile?.is_admin) { router.push('/articles'); return; }
      setAllowed(true);
      setChecked(true);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !eyebrow.trim() || !excerpt.trim() || !content.trim()) {
      setError('Заполни все поля');
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', userData.user.id).single();
    const { data: newArticle, error: insertError } = await supabase.from('articles').insert({
      title: title.trim(),
      eyebrow: eyebrow.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author_id: userData.user.id,
      author_name: profile?.nickname || 'Редакция',
    }).select().single();
    if (insertError) { setError(insertError.message); return; }
    router.push(`/articles/${newArticle.id}`);
  }

  if (!checked) return <div className="container"><p className="count">Проверяю доступ...</p></div>;
  if (!allowed) return null;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2>Новая статья</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Рубрика (например, «Практика»)</label>
        <input className="field" value={eyebrow} onChange={e => setEyebrow(e.target.value)} />
        <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Заголовок</label>
        <input className="field" value={title} onChange={e => setTitle(e.target.value)} />
        <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Короткое описание (видно в списке статей)</label>
        <input className="field" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        <label style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', display: 'block', marginBottom: 6 }}>Текст статьи</label>
        <textarea className="field" style={{ minHeight: 260 }} value={content} onChange={e => setContent(e.target.value)} />
        {error && <p className="error-text">{error}</p>}
        <button className="btn-brass" type="submit">Опубликовать</button>
      </form>
    </div>
  );
}
