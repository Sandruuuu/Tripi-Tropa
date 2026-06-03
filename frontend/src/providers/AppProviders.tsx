'use client';

import { SWRConfig } from 'swr';
import { ToastProvider } from './ToastProvider';
import { getErrorMessage } from '@/lib/api';

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
      <ToastProvider>{children}</ToastProvider>
    </SWRConfig>
  );
}
