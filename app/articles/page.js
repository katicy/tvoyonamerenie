'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadArticles();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
          .then(({ data: profile }) => setIsAdmin(!!profile?.is_admin));
      }
    });
  }, []);

  async function loadArticles() {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="section-head">
        <h2>Статьи и практики</h2>
        <span className="count">{articles.length} материалов</span>
      </div>

      {isAdmin && (
        <Link href="/articles/new">
          <button className="btn-brass" style={{ marginBottom: 24 }}>+ Написать статью</button>
        </Link>
      )}

      {loading ? (
        <p className="count">Загружаю статьи...</p>
      ) : articles.length === 0 ? (
        <p className="count">Пока нет ни одной статьи.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {articles.map(a => (
            <Link href={`/articles/${a.id}`} key={a.id}>
              <div style={{ borderBottom: '1px solid var(--line-dark)', paddingBottom: 20 }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--brass-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{a.eyebrow}</div>
                <h3 style={{ fontSize: 17, margin: '0 0 8px', fontWeight: 500 }}>{a.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(22,33,28,0.6)', margin: 0 }}>{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
