import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { prisma } from '@/lib/prisma';
import LocalSeoSchema from '@/components/seo/LocalSeoSchema';
import { generateFullMetadata } from '@/lib/seo-metadata';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: 'swap',
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

export async function generateMetadata(): Promise<Metadata> {
  return generateFullMetadata({
    type: 'website'
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch custom code settings
  let settings: any[] = [];
  
  try {
    settings = await prisma.setting.findMany({
      where: {
        key: { in: ['custom_css', 'head_scripts', 'body_scripts', 'seo_custom_webmaster_tags', 'seo_norton_verify'] }
      }
    });
  } catch (error) {
    console.warn("Could not fetch root layout settings during build (Prisma skipped)");
  }
  
  const settingsObj = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plusJakarta.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {settingsObj.custom_css && (
          <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settingsObj.custom_css }} />
        )}
        {settingsObj.seo_norton_verify && (
          <meta name="norton-safeweb-site-verification" content={settingsObj.seo_norton_verify} />
        )}
        <LocalSeoSchema />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {settingsObj.head_scripts && (
          <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: settingsObj.head_scripts }} />
        )}
        
        {children}
        
        {settingsObj.body_scripts && (
          <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: settingsObj.body_scripts }} />
        )}
      </body>
    </html>
  );
}
