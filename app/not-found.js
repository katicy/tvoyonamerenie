import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
      <div style={{ background: 'var(--ink)', borderRadius: 8, padding: '48px 24px' }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontSize: 44, color: 'var(--brass)', margin: '0 0 12px', fontWeight: 500 }}>404</p>
        <p style={{ fontSize: 18, color: 'var(--paper-dim)', margin: '0 0 8px', fontWeight: 500 }}>Эта страница ещё не материализовалась</p>
        <p style={{ fontSize: 13, color: 'rgba(237,230,211,0.65)', margin: '0 0 24px', lineHeight: 1.5 }}>
          Возможно, ссылка устарела, или намерение пока не оформилось в реальность.
        </p>
        <Link href="/">
          <button className="btn-brass">Вернуться на главную</button>
        </Link>
      </div>
    </div>
  );
}
