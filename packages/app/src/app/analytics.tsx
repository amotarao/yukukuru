'use client';

import { logEvent } from 'firebase/analytics';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useAnalytics } from '../modules/analytics';

export default function Analytics() {
  const pathname = usePathname();

  const analytics = useAnalytics();

  const pageView = useCallback(() => {
    analytics && logEvent(analytics, 'page_view');
  }, [analytics]);

  useEffect(() => {
    console.log(pathname);
    pageView();
  }, [pageView, pathname]);

  return null;
}
