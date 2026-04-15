import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';

export default async function LandingPage() {
  const session = await auth();

  // ログイン済みならカード作成ページへ
  if (session) {
    redirect('/cards/new');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">loop-learn</h1>
        <p className="text-xl text-gray-600 mb-3">
          アクティブリコール × 間隔反復で学びを定着させる
        </p>
        <p className="text-gray-500 mb-10">
          技術書・ドキュメントから得た知識を、科学的学習法で長期記憶に転換する学習ツール。
          webエンジニアのスキルアップを加速させます。
        </p>

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/cards/new' });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </button>
        </form>

        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <li className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800 mb-1">アクティブリコール</h3>
            <p className="text-sm text-gray-500">問題形式で記憶を引き出し、定着率を最大化</p>
          </li>
          <li className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800 mb-1">間隔反復</h3>
            <p className="text-sm text-gray-500">SM-2アルゴリズムが最適な復習タイミングを自動管理</p>
          </li>
          <li className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800 mb-1">エンジニア特化</h3>
            <p className="text-sm text-gray-500">コード・Markdownに対応した入力フォーマット</p>
          </li>
        </ul>
      </div>
    </main>
  );
}
