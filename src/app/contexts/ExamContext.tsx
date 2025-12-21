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
  selectedPaperIndex: number;
  setSelectedPaperIndex: (index: number) => void;
  currentExamUrl: string;
  setCurrentExamUrl: (url: string) => void;
  currentMarkingSchemeUrl: string;
  setCurrentMarkingSchemeUrl: (url: string) => void;
  currentAudioUrl: string;
  setCurrentAudioUrl: (url: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [selectionArray, setSelectionArray] = useState<SelectionArray>(["lc", "3", "2025", "EV", "Higher"]);
  const [examPaperList, setExamPaperList] = useState<string[][]>([[""]]);
  const [isCompact, setIsCompact] = useState(false);
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const [currentExamUrl, setCurrentExamUrl] = useState("");
  const [currentMarkingSchemeUrl, setCurrentMarkingSchemeUrl] = useState("");
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");

  return (
    <ExamContext.Provider value={{
      selectionArray, setSelectionArray,
      examPaperList, setExamPaperList,
      isCompact, setIsCompact,
      selectedPaperIndex, setSelectedPaperIndex,
      currentExamUrl, setCurrentExamUrl,
      currentMarkingSchemeUrl, setCurrentMarkingSchemeUrl,
      currentAudioUrl, setCurrentAudioUrl,
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
