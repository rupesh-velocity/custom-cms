import type { Metadata } from "next";
import "./globals.css";
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Custom CMS',
  description: 'Custom CMS',
};

export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let fontFamilies: { name: string, variations: { weight: string, style: string, woff2Url: string }[] }[] = [];
  let customCss = '';
  let headScripts = '';
  let bodyScripts = '';
  
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    if (settingsObj.custom_fonts) {
      fontFamilies = JSON.parse(settingsObj.custom_fonts);
    }
    customCss = settingsObj.custom_css || '';
    headScripts = settingsObj.head_scripts || '';
    bodyScripts = settingsObj.body_scripts || '';
  } catch (e) {
    // Ignore db connection issues during build
  }

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {headScripts ? <div style={{display: 'none'}} dangerouslySetInnerHTML={{ __html: headScripts }} /> : null}
        {(fontFamilies.length > 0 || customCss) ? (
          <style dangerouslySetInnerHTML={{
            __html: `
              ${fontFamilies.map(family => 
                family.variations.map(v => `
                  @font-face {
                    font-family: '${family.name}';
                    src: url('${v.woff2Url}') format('woff2');
                    font-weight: ${v.weight};
                    font-style: ${v.style};
                    font-display: swap;
                  }
                `).join('\n')
              ).join('\n')}
              ${customCss}
            `
          }} />
        ) : null}
        {children}
        {bodyScripts ? <div style={{display: 'none'}} dangerouslySetInnerHTML={{ __html: bodyScripts }} /> : null}
      </body>
    </html>
  );
}
