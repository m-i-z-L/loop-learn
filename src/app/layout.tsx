import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'loop-learn — アクティブリコール × 間隔反復',
  description: '技術書・ドキュメントから得た知識を長期記憶に定着させる学習ツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
