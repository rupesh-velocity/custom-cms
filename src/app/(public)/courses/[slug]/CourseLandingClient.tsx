'use client';

import Link from 'next/link';

interface CourseLandingClientProps {
  course: {
    id: number;
    title: string;
    contentHtml: string | null;
    featuredImage: string | null;
  }
}

export default function CourseLandingClient({ course }: CourseLandingClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 w-full font-sans pb-16">
      
      {/* Hero Banner */}
      <div className="bg-[#111827] text-white pt-24 pb-32 px-6 border-b-8 border-[#5e3fde] relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5e3fde 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#5e3fde]/20 text-[#a5b4fc] font-bold text-sm mb-6 border border-[#5e3fde]/30 uppercase tracking-widest">
              Premium Course
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl font-medium leading-relaxed">
              Enroll today to unlock exclusive video lessons, comprehensive guides, and expert knowledge tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href={`/checkout?type=course&id=${course.id}`}
                className="bg-[#5e3fde] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#4b32b2] hover:scale-105 transition-all shadow-lg shadow-[#5e3fde]/30 text-center"
              >
                Enroll Now
              </Link>
              <a 
                href="#curriculum"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center backdrop-blur-sm"
              >
                View Curriculum
              </a>
            </div>
          </div>
          
          {course.featuredImage && (
            <div className="w-full md:w-5/12 lg:w-1/3 shrink-0 perspective-1000">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 bg-gray-900">
                <img src={course.featuredImage} alt={course.title} className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div id="curriculum" className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 lg:p-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-outfit pb-6 border-b border-gray-100">About This Course</h2>
          
          {course.contentHtml ? (
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.contentHtml }}
            />
          ) : (
            <p className="text-gray-500 italic text-lg">Detailed course description coming soon...</p>
          )}

          <div className="mt-16 pt-10 border-t border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Join today and get immediate access to all the course materials.</p>
            <Link 
              href={`/checkout?type=course&id=${course.id}`}
              className="inline-block bg-[#5e3fde] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#4b32b2] hover:shadow-lg transition-all"
            >
              Enroll Now to Unlock Access
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
