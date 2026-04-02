"use client";

import Script from "next/script";
import { TAPFILIATE_ACCOUNT_ID } from "@/utils/tapfiliate";

/**
 * Global Tapfiliate: referral detection on every page (tap detect).
 * https://tapfiliate.com/docs/javascript/
 */
export default function TapfiliateSiteScript() {
  const inline = `(function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){(t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');
tap('create',${JSON.stringify(TAPFILIATE_ACCOUNT_ID)},{integration:"javascript"});
tap('detect');`;

  return (
    <>
      <Script
        id="tapfiliate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inline }}
      />
      <Script
        src="https://script.tapfiliate.com/tapfiliate.js"
        strategy="afterInteractive"
      />
    </>
  );
}
