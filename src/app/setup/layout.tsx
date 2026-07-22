import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  try {
    const userCount = await prisma.user.count();
    // If a user already exists, lock the setup screen and redirect to login!
    if (userCount > 0) {
      redirect('/login');
    }
  } catch (error) {
    console.error("Error checking user count in setup:", error);
  }

  return <>{children}</>;
}
