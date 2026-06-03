'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdUnit({ slotId }: { slotId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Safely initialize the ad on the client side
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense initialization failed:', error);
    }
  }, [pathname]); // Re-run when the route changes

  return (
    // The key={pathname} forces React to destroy and recreate the DOM element 
    // on route change, ensuring Google provides a fresh ad.
    <div key={pathname} className="min-h-[250px] w-full flex justify-center overflow-hidden my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}