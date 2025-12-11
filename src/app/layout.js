// app/layout.tsx
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import TopStrip from "@/components/_common/TopStrip";
import MiddleHeader from "@/components/_common/MiddleHeader";
import Footer from "@/components/_common/Footer";
import AppProviders from "@/providers/AppProviders";
import Script from "next/script";
import Analytics from "@/components/_common/Analytics";
import { GA_TRACKING_ID } from "@/utils/constants";

// ✅ Import Poppins with all weights you want
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Aayeu Ecommerce",
  description: "Ecommerce website for Aayeu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {/* GA SCRIPT */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />

        <Script id="ga-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            send_page_view: false
          });
        `}
        </Script>

        <AppProviders>
          <Analytics />
          <TopStrip />
          <MiddleHeader />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
