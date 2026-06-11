import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AEGIS-AI | Autonomous Enterprise Grade Industrial Safety Intelligence',
  description: 'Enterprise-grade industrial safety intelligence platform for hazard monitoring, equipment health, worker compliance, and incident management.',
  keywords: ['industrial safety', 'hazard monitoring', 'AI safety', 'AEGIS', 'enterprise', 'telemetry'],
  authors: [{ name: 'AEGIS Systems' }],
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetBrainsMono.variable} ${orbitron.variable} scanlines`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
