import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ background: 'var(--ink)', minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontSize: 56, color: 'var(--brass)', margin: '0 0 16px', fontWeight: 500 }}>404</p>
        <p style={{ fontSize: 20, color: 'var(--paper-dim)', margin: '0 0 10px', fontWeight: 500 }}>Эта страница ещё не материализовалась</p>
        <p style={{ fontSize: 14, color: 'rgba(237,230,211,0.65)', margin: '0 0 28px', lineHeight: 1.5 }}>
          Возможно, ссылка устарела, или намерение пока не оформилось в реальность.
        </p>
        <Link href="/">
          <button className="btn-brass">Вернуться на главную</button>
        </Link>
      </div>
    </div>
  );
}
