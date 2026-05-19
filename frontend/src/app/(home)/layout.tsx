import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
});

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div className={cinzel.variable}>{children}</div>;
}
