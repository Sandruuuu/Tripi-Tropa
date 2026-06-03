'use client';

import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { getErrorMessage } from '@/lib/api';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (error) => {
          console.error('[SWR]', getErrorMessage(error));
        },
      }}
    >
      {children}
      <Toaster richColors position="bottom-right" />
    </SWRConfig>
  );
}
