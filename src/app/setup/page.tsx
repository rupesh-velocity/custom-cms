import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      redirect('/login');
    }
  } catch (error) {
    console.error("Error checking user count in setup:", error);
  }

  return <SetupForm />;
}
