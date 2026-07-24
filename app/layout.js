import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Твоё намерение — практика манифестации',
  description: 'Сообщество про манифестацию: желания, форум, дневник аффирмаций',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
     <body>
        <Nav />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
