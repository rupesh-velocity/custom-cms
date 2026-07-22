import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  let shouldRedirect = false;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      shouldRedirect = true;
    }
  } catch (error: any) {
    console.error("Error checking user count in setup:", error);
    return (
      <div className="p-8 text-red-500">
        <h1>Database Connection Error</h1>
        <p>{error?.message || String(error)}</p>
      </div>
    );
  }

  if (shouldRedirect) {
    redirect('/login');
  }

  return <SetupForm />;
}
