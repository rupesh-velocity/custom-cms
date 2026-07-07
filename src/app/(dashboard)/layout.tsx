import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import VideoFacadeHandler from '@/components/VideoFacadeHandler';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader hideMenu={true} />
      {children}
      <SiteFooter />
      <VideoFacadeHandler />
    </>
  );
}
