import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Cinzel, Inter } from 'next/font/google';

import { QueryProvider } from '@/components/providers/query';
import Header from '@/components/shared/header';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
});

export const metadata: Metadata = {
  title: 'Splendor',
  description: 'Gems be gemming',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${cinzel.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="flex min-h-screen flex-col items-center justify-items-center space-y-4 p-8">
              <Header />
              {children}
            </div>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
