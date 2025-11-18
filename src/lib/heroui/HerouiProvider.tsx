'use client';

import { HeroUIProvider } from '@heroui/react';

interface Props {
  children: React.ReactNode;
}

export function HerouiProvider({ children }: Props) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}

