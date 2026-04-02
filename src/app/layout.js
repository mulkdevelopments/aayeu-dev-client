// app/layout.tsx
import { Inter, Poppins, Raleway } from "next/font/google";
import "../styles/globals.css";
import AppProviders from "@/providers/AppProviders";
import { GTM_CONTAINER_ID } from "@/utils/constants";
import ConditionalLayout from "@/components/ConditionalLayout";
import CookieConsentBanner from "@/components/_common/CookieConsentBanner";
import TapfiliateSiteScript from "@/components/_analytics/TapfiliateSiteScript";
import {
  getConsentDefaultScript,
  getConsentRestoreScript,
} from "@/utils/cookieConsent";

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

const GTM_HEAD_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getConsentDefaultScript() }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: getConsentRestoreScript() }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: GTM_HEAD_SNIPPET }}
        />
      </head>
      <body className={`${poppins.className} ${inter.variable} ${raleway.variable} antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <AppProviders>
          <TapfiliateSiteScript />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <CookieConsentBanner />
        </AppProviders>
      </body>
    </html>
  );
}
