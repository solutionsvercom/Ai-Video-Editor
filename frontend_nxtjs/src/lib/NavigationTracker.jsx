"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Track page navigation
  }, [pathname]);
  return null;
}
