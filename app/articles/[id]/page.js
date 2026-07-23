'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ArticlePage({ params }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('articles').select('*').eq('id', params.id).single()
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="container"><p className="count">Загружаю...</p></div>;
  if (!article) return <div className="container">Статья не найдена</div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <Link href="/articles" className="mono" style={{ color: 'var(--brass-dim)', fontSize: 12 }}>← все статьи</Link>
      <div className="mono" style={{ fontSize: 11, color: 'var(--brass-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 8px' }}>{article.eyebrow}</div>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>{article.title}</h1>
      <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.5)', marginBottom: 24 }}>{article.author_name}</p>
      <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{article.content}</div>
    </div>
  );
}
