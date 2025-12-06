'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

interface DialogContextType {
  aboutIsOpen: boolean;
  setAboutIsOpen: (open: boolean) => void;
  contactIsOpen: boolean;
  setContactIsOpen: (open: boolean) => void;
  shareIsOpen: boolean;
  setShareIsOpen: (open: boolean) => void;
  resourcesIsOpen: boolean;
  setResourcesIsOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [aboutIsOpen, setAboutIsOpen] = useState(false);
  const [contactIsOpen, setContactIsOpen] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [resourcesIsOpen, setResourcesIsOpen] = useState(false);

  return (
    <DialogContext.Provider value={{
      aboutIsOpen, setAboutIsOpen,
      contactIsOpen, setContactIsOpen,
      shareIsOpen, setShareIsOpen,
      resourcesIsOpen, setResourcesIsOpen,
    }}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialogs must be used within DialogProvider');
  return context;
}
