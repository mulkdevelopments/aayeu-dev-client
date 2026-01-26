// app/layout.tsx
import { Inter, Poppins } from "next/font/google";
import "../styles/globals.css";
import AppProviders from "@/providers/AppProviders";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/utils/constants";
import ConditionalLayout from "@/components/ConditionalLayout";

// ✅ Import Poppins with all weights you want
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Aayeu Designer Fashion  ",
  description: "Aayeu is a designer fashion and lifestyle ecommerce website that offers a wide range of products for men, women.",
  icons: {
    icon: "/assets/images/favicon.png",
    shortcut: "/assets/images/favicon.png",
    apple: "/assets/images/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${inter.variable} antialiased`}>
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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AppProviders>
      </body>
    </html>
  );
}
