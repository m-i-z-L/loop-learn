import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppNav from '@/components/layout/AppNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav session={session} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
