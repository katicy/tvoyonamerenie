const ARTICLES = [
  { eyebrow: 'Основы', title: 'Что такое манифестация на самом деле', excerpt: 'Механика метода без эзотерики — что говорит психология намерения.' },
  { eyebrow: 'Практика', title: 'Техника 369: как вести записи правильно', excerpt: 'Разбор популярной техники с примерами формулировок.' },
  { eyebrow: 'Визуализация', title: 'Доска желаний, которая действительно работает', excerpt: 'Почему важна конкретика образов и связь с действиями.' },
  { eyebrow: 'Разбор', title: 'Аффирмации: как формулировать, чтобы верить', excerpt: 'Частая ошибка — писать желаемое как отрицание.' },
];

export default function ArticlesPage() {
  return (
    <div className="container">
      <div className="section-head">
        <h2>Статьи и практики</h2>
        <span className="count">{ARTICLES.length} материалов</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {ARTICLES.map((a, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--line-dark)', paddingBottom: 20 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--brass-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{a.eyebrow}</div>
            <h3 style={{ fontSize: 17, margin: '0 0 8px', fontWeight: 500 }}>{a.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(22,33,28,0.6)', margin: 0 }}>{a.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
