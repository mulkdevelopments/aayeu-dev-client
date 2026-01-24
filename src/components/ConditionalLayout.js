'use client';

import { usePathname } from 'next/navigation';
import TopStrip from "@/components/_common/TopStrip";
import MiddleHeader from "@/components/_common/MiddleHeader";
import Footer from "@/components/_common/Footer";
import FooterNewsletter from "@/components/_common/FooterNewsletter";
import MobileBottomNav from "@/components/_common/MobileBottomNav";
import Analytics from "@/components/_common/Analytics";
import CountrySelectionModal from "@/components/_common/CountrySelectionModal";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const isMaintenancePage = pathname === '/maintenance';

  // If maintenance mode is enabled OR on maintenance page, hide header/footer
  if (isMaintenanceMode || isMaintenancePage) {
    return <>{children}</>;
  }

  // Normal layout with header and footer
  return (
    <>
      <Analytics />
      <CountrySelectionModal />
      <TopStrip />
      <MiddleHeader />  

      <main className="pb-0 md:pb-0">
        {children}
      </main>

      <FooterNewsletter />
      <Footer />
      {/* <MobileBottomNav /> */}
    </>
  );
}
