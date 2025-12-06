'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

type SelectionArray = [string, string, string, string, string]; // [cert, subject, year, lang, level]

interface ExamContextType {
  selectionArray: SelectionArray;
  setSelectionArray: (arr: SelectionArray) => void;
  examPaperList: string[][];
  setExamPaperList: (list: string[][]) => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [selectionArray, setSelectionArray] = useState<SelectionArray>(["lc", "3", "2025", "EV", "Higher"]);
  const [examPaperList, setExamPaperList] = useState<string[][]>([[""]]);
  const [isCompact, setIsCompact] = useState(false);

  return (
    <ExamContext.Provider value={{
      selectionArray, setSelectionArray,
      examPaperList, setExamPaperList,
      isCompact, setIsCompact,
    }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within ExamProvider');
  return context;
}
