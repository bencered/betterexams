'use client'
import { ReactNode } from 'react';
import { DialogProvider } from './DialogContext';
import { ExamProvider } from './ExamContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DialogProvider>
      <ExamProvider>
        {children}
      </ExamProvider>
    </DialogProvider>
  );
}
