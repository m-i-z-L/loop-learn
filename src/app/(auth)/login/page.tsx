import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Googleサインインの開始に失敗しました。もう一度お試しください。',
  OAuthCallback: 'Googleからのコールバック処理に失敗しました。もう一度お試しください。',
  OAuthCreateAccount: 'アカウントの作成に失敗しました。もう一度お試しください。',
  default: 'ログインに失敗しました。もう一度お試しください。',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session) {
    redirect('/');
  }

  const params = await searchParams;
  const errorMessage = params.error
    ? (ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.default)
    : null;
  const rawCallback = params.callbackUrl ?? '/';
  const callbackUrl =
    rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/';

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">loop-learn</h1>
        <p className="text-gray-500 text-sm">
          アクティブリコール × 間隔反復で学びを定着させる
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        action={async () => {
          'use server';
          await signIn('google', { redirectTo: callbackUrl });
        }}
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
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

      <p className="mt-4 text-center text-xs text-gray-400">
        ログインすることで、
        <a href="#" className="underline hover:text-gray-600">利用規約</a>
        および
        <a href="#" className="underline hover:text-gray-600">プライバシーポリシー</a>
        に同意したものとみなします。
      </p>
    </>
  );
}
