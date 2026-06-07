'use client'
import { useEffect } from "react";
import { useExam } from "../../contexts/ExamContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaperOption {
  label: string;
  examUrl: string;
  isDeferred: boolean;
  markingSchemeUrl?: string;
  audioUrl?: string;
}

export default function PaperTypeSelector() {
  const {
    examPaperList,
    selectedPaperIndex,
    setSelectedPaperIndex,
    setCurrentExamUrl,
    setCurrentMarkingSchemeUrl,
    setCurrentAudioUrl,
    selectionArray
  } = useExam();

  const [, , , lang, level] = selectionArray;

  // Extract exam papers and deferred exam papers (not marking schemes)
  const examPapers = examPaperList.filter(
    paper => paper[0] === 'exampapers' || paper[0] === 'deferredexams'
  );

  // Group papers by type (Paper One, Paper Two, etc.)
  const papersByType = examPapers.reduce((acc: { [key: string]: PaperOption }, paper) => {
    const category = paper[0];
    const details = paper[2];
    const url = paper[4];
    const isDeferred = category === 'deferredexams';

    // Extract paper type (Paper One, Paper Two, Foundation Level, etc.)
    let paperType = '';
    if (details.includes('Paper One')) {
      paperType = 'Paper 1';
    } else if (details.includes('Paper Two')) {
      paperType = 'Paper 2';
    } else if (details.includes('Paper Three')) {
      paperType = 'Paper 3';
    } else if (details.includes('Foundation Level') && !details.includes('Paper')) {
      paperType = 'Foundation Level';
    } else if (details.includes('Sound File') || details.includes('Aural')) {
      return acc; // Skip audio files for now
    } else {
      paperType = details.split('/')[0].trim();
    }

    // Only add if it matches current level and language
    const matchesLevel = details.includes(level);
    const matchesLang = details.includes(lang);

    // Deferred papers get their own option so they don't collide with the
    // regular paper of the same type.
    const optionKey = isDeferred ? `${paperType} (Deferred)` : paperType;

    if (matchesLevel && matchesLang && paperType && !acc[optionKey]) {
      acc[optionKey] = {
        label: optionKey,
        examUrl: url,
        isDeferred,
      };
    }

    return acc;
  }, {});

  const paperOptions = Object.values(papersByType);

  // Find corresponding marking scheme
  const updateUrls = (index: number) => {
    if (index < 0 || index >= paperOptions.length) return;

    const selectedPaper = paperOptions[index];
    setCurrentExamUrl(selectedPaper.examUrl);

    // Find marking scheme that matches current level and language. Deferred
    // papers are paired with the deferred marking scheme.
    const markingSchemeCategory = selectedPaper.isDeferred
      ? 'deferredmarkingschemes'
      : 'markingschemes';
    const markingScheme = examPaperList.find(paper =>
      paper[0] === markingSchemeCategory &&
      paper[2].includes(level) &&
      paper[2].includes(lang)
    );

    setCurrentMarkingSchemeUrl(markingScheme ? markingScheme[4] : '');

    // Find audio file if exists
    const audioFile = examPaperList.find(paper =>
      (paper[2].includes('Sound File') || paper[2].includes('.mp3')) &&
      paper[2].includes(lang)
    );

    if (audioFile) {
      setCurrentAudioUrl(audioFile[4]);
    } else {
      setCurrentAudioUrl('');
    }
  };

  const handleChange = (value: string) => {
    const index = parseInt(value);
    setSelectedPaperIndex(index);
    updateUrls(index);
  };

  // Auto-select first paper on mount or when papers change
  useEffect(() => {
    if (paperOptions.length > 0) {
      updateUrls(0);
      setSelectedPaperIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examPaperList]);

  if (paperOptions.length === 0) {
    return (
      <div className="text-zinc-500 text-sm py-2">
        No papers available
      </div>
    );
  }

  return (
    <Select value={selectedPaperIndex.toString()} onValueChange={handleChange}>
      <SelectTrigger className="w-full h-10 text-white bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800">
        <SelectValue>
          {paperOptions[selectedPaperIndex]?.label || 'Select Paper'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
        {paperOptions.map((option, index) => (
          <SelectItem
            key={index}
            value={index.toString()}
            className="hover:bg-zinc-800 focus:bg-zinc-700"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
