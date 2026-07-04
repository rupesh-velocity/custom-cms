import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { prisma } from '@/lib/prisma';

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

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: [
        'site_title', 'site_tagline', 'site_icon', 
        'seo_google_verify', 'seo_bing_verify', 'seo_baidu_verify', 
        'seo_yandex_verify', 'seo_pinterest_verify' // norton doesn't have native Next.js support, we'll put it in other
      ] }
    }
  });
  
  const settingsObj = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const title = settingsObj.site_title || 'Custom CMS';
  const description = settingsObj.site_tagline || 'A custom CMS built with Next.js';
  
  return {
    title,
    description,
    icons: settingsObj.site_icon ? [
      { rel: 'icon', url: settingsObj.site_icon },
      { rel: 'apple-touch-icon', url: settingsObj.site_icon },
    ] : undefined,
    verification: {
      google: settingsObj.seo_google_verify,
      yahoo: settingsObj.seo_bing_verify, // Next.js uses yahoo/yandex/google
      yandex: settingsObj.seo_yandex_verify,
      other: {
        'msvalidate.01': settingsObj.seo_bing_verify,
        'baidu-site-verification': settingsObj.seo_baidu_verify,
        'p:domain_verify': settingsObj.seo_pinterest_verify,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch custom code settings
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ['custom_css', 'head_scripts', 'body_scripts', 'seo_custom_webmaster_tags', 'seo_norton_verify'] }
    }
  });
  
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
          <style dangerouslySetInnerHTML={{ __html: settingsObj.custom_css }} />
        )}
        {settingsObj.seo_norton_verify && (
          <meta name="norton-safeweb-site-verification" content={settingsObj.seo_norton_verify} />
        )}
        {settingsObj.seo_custom_webmaster_tags && (
          <div dangerouslySetInnerHTML={{ __html: settingsObj.seo_custom_webmaster_tags }} />
        )}
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
