"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { trackMetaPageView, trackMetaViewContent } from "@/lib/meta-pixel";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

export function MetaPixelProvider() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);

  const isLandingPath = useMemo(() => {
    return pathname === "/" || pathname === "/es" || pathname === "/en";
  }, [pathname]);

  useEffect(() => {
    if (!pixelId || !loaded) return;

    trackMetaPageView();

    if (isLandingPath) {
      trackMetaViewContent({
        content_name: "DJ Pro IA Landing Page",
        content_category: "landing_page",
      });
    }
  }, [loaded, pathname, isLandingPath]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel-bootstrap" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
        `}
      </Script>

      <Script
        id="meta-pixel-loaded"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      >
        {`window.__metaPixelReady = true;`}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
