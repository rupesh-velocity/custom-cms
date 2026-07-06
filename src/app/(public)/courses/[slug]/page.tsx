import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import CourseViewerClient from './CourseViewerClient';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // 1. Fetch course details
  const course = await prisma.course.findUnique({
    where: { slug: resolvedParams.slug }
  });
  
  if (!course) {
    notFound();
  }

  // 2. Verify Authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('cms_session')?.value;
  
  if (!token) {
    redirect(`/login?redirect=/courses/${resolvedParams.slug}`);
  }

  let userId: number | null = null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
    );
    const { payload } = await jwtVerify(token, secret);
    userId = payload.id as number;
  } catch (error) {
    redirect(`/login?redirect=/courses/${resolvedParams.slug}`);
  }

  // 3. Verify Access
  const access = await prisma.userCourseAccess.findFirst({
    where: {
      userId: userId,
      courseId: course.id
    }
  });

  if (!access) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 text-[#2c3338]">
        <div className="bg-white p-8 max-w-md w-full rounded-xl shadow-lg border border-[#e5e7eb] text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
          <p className="text-[#50575e] mb-6">You need to purchase this course to view the content.</p>
          <a href="/shop" className="block w-full bg-[#5e3fde] text-white py-3 rounded-lg font-medium hover:bg-[#4b32b2] transition-colors">
            View Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <CourseViewerClient course={course} />
    </div>
  );
}
