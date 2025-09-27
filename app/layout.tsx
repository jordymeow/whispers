import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: "Whispers",
  description: "Thoughts in the quiet hours",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body style={{ minHeight: '100vh' }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
