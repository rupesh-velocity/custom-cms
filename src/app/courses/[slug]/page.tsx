import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="text-xl font-bold text-[#5e3fde] tracking-tight">YourLogo</div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="/my-account" className="text-gray-600 hover:text-[#5e3fde] transition-colors">My Dashboard</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Col - Video & Description */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{course.title}</h1>
          
          <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video mb-8 border border-gray-200 relative group">
            {course.videoUrl ? (
              <iframe 
                src={course.videoUrl} 
                className="w-full h-full pointer-events-auto"
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen
                // Prevent right click on video container
                onContextMenu={(e) => e.preventDefault()}
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No video available.
              </div>
            )}
            {/* Invisible overlay over edges to block some native right-click/download tools if iframe allows it, though iframe mostly handles itself */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] rounded-xl"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">About this Flow</h2>
            <div 
              className="prose prose-purple max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.contentHtml || '' }}
            />
          </div>
        </div>

        {/* Right Col - Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Course Progress</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-[#5e3fde]/10 rounded-lg border border-[#5e3fde]/20">
                <div className="w-8 h-8 rounded-full bg-[#5e3fde] text-white flex items-center justify-center font-bold text-sm">1</div>
                <div className="font-semibold text-[#5e3fde]">{course.title}</div>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-not-allowed opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">2</div>
                <div className="font-medium text-gray-500">More coming soon</div>
              </div>
            </div>

            <button className="w-full bg-[#5e3fde] text-white py-3 rounded-lg font-medium hover:bg-[#4b32b2] transition-all transform hover:scale-[1.02] shadow-md shadow-[#5e3fde]/20">
              Mark as Complete
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
