import { prisma } from '@/lib/prisma';
import LocalSeoSchema from '@/components/seo/LocalSeoSchema';

export default async function RootSettingsLoader({ children }: { children: React.ReactNode }) {
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
    <>
      {settingsObj.custom_css && (
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settingsObj.custom_css }} />
      )}
      {settingsObj.seo_norton_verify && (
        <meta name="norton-safeweb-site-verification" content={settingsObj.seo_norton_verify} />
      )}
      <LocalSeoSchema />
      
      {settingsObj.head_scripts && (
        <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: settingsObj.head_scripts }} />
      )}
      
      {children}
      
      {settingsObj.body_scripts && (
        <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: settingsObj.body_scripts }} />
      )}
    </>
  );
}
