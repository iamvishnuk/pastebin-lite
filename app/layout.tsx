import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Pastebin-Lite',
  description:
    'A minimal pastebin application for sharing text pastes with TTL and view limits'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} font-inter antialiased`}>
        <main className='bg-background min-h-screen w-full'>
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
