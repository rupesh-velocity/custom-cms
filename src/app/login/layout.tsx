import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      redirect('/setup');
    }
  } catch (error) {
    console.error("Error checking user count:", error);
  }

  return <>{children}</>;
}
