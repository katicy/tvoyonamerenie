import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Твоё намерение — практика манифестации',
  description: 'Сообщество про манифестацию: желания, форум, дневник аффирмаций',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
