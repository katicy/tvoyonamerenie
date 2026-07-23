import Link from 'next/link';

export default function Footer() {
  return (
    <div style={{ background: 'var(--ink)', color: 'rgba(237,230,211,0.6)', padding: '24px 32px', marginTop: 40 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12 }}>
        <span>© {new Date().getFullYear()} твоё намерение</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/rules" style={{ color: 'inherit' }}>Правила сообщества</Link>
        </div>
      </div>
    </div>
  );
}
