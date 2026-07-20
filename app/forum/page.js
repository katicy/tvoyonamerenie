'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORIES } from '@/lib/categories';

export default function ForumPage() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    async function loadCounts() {
      const { data } = await supabase.from('forum_topics').select('category');
      const c = {};
      (data || []).forEach(t => { c[t.category] = (c[t.category] || 0) + 1; });
      setCounts(c);
    }
    loadCounts();
  }, []);

  return (
    <div className="container">
      <div className="section-head">
        <h2>Обсуждения</h2>
        <span className="count">{CATEGORIES.length} разделов</span>
      </div>
      {CATEGORIES.map(c => (
        <Link href={`/forum/${c.key}`} key={c.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px', borderBottom: '1px solid var(--line-dark)' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>{c.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(22,33,28,0.55)', margin: 0 }}>{c.desc}</p>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(22,33,28,0.45)' }}>{counts[c.key] || 0} тем</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
