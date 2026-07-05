import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import VideoFacadeHandler from '@/components/VideoFacadeHandler';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <VideoFacadeHandler />
    </>
  );
}
