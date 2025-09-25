import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: "Midnight Whispers",
  description: "Thoughts in the quiet hours",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
