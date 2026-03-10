// app/layout.tsx
import { Inter, Poppins, Raleway } from "next/font/google";
import "../styles/globals.css";
import AppProviders from "@/providers/AppProviders";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/utils/constants";
import ConditionalLayout from "@/components/ConditionalLayout";

//  Import Poppins with all weights you want
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
const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata = {
  title: "AAYEU powered by FashionTV | Defining Luxury and Quality",
  description: "AAYEU powered by FashionTV — Defining luxury and quality. Designer fashion and lifestyle ecommerce for men and women.",
  icons: {
    icon: [
      { url: "/assets/images/favicon/16x16.jpg.jpeg", sizes: "16x16", type: "image/jpeg" },
      { url: "/assets/images/favicon/32x32.jpg.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/assets/images/favicon/48x48.jpg.jpeg", sizes: "48x48", type: "image/jpeg" },
    ],
    shortcut: "/assets/images/favicon/32x32.jpg.jpeg",
    apple: "/assets/images/favicon/180x180.jpg.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${inter.variable} ${raleway.variable} antialiased`}>
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
