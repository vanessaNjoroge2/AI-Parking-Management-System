import React from 'react';
import { MobileFrame } from '../components/MobileFrame';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return <MobileFrame>{children}</MobileFrame>;
}
