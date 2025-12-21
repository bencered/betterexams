/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { Check, ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useExam } from "../../contexts/ExamContext";

var data = require('../../files/data.json');
var subNumsToNames = data["subNumsToNames"]

const url: string = "https://www.examinations.ie/archive";
const STORAGE_KEY = "betterexams-v2-selection";

function getStoredSelection() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSelection(selection: { cert: string; subject: string; year: string; level: string; lang: string }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Ignore storage errors
  }
}

const defaults = {
  cert: "lc",
  subject: "3",
  year: "2025",
  level: "Higher",
  lang: "EV"
};

let newExamList: string[][];
let currentLevel: string = getStoredSelection()?.level || "Higher";

let tempHigherDisabled: boolean = false;
let tempOrdinaryDisabled: boolean = false;
let tempFoundationDisabled: boolean = false;
let tempCommonDisabled: boolean = false;

export default function ExamSelectionForm() {
  const searchQuery = useSearchParams();
  const { setSelectionArray, setExamPaperList } = useExam();

  // Get initial values: URL params > localStorage > defaults
  const getInitialValues = () => {
    const stored = getStoredSelection();

    // URL params take precedence
    if (searchQuery?.has("cert") || searchQuery?.has("subject")) {
      return {
        cert: searchQuery?.get("cert") || stored?.cert || defaults.cert,
        subject: searchQuery?.get("subject") || stored?.subject || defaults.subject,
        year: searchQuery?.get("year") || stored?.year || defaults.year,
        level: searchQuery?.get("level") || stored?.level || defaults.level,
        lang: searchQuery?.get("lang") || stored?.lang || defaults.lang,
      };
    }

    // Fall back to stored or defaults
    return {
      cert: stored?.cert || defaults.cert,
      subject: stored?.subject || defaults.subject,
      year: stored?.year || defaults.year,
      level: stored?.level || defaults.level,
      lang: stored?.lang || defaults.lang,
    };
  };

  const initial = getInitialValues();

  const [certificate, setCertificate] = useState<string>(initial.cert);
  const [subject, setSubject] = useState<string>(initial.subject);
  const [year, setYear] = useState<string>(initial.year);
  const [language, setLanguage] = useState<string>(initial.lang);
  const [level, setLevel] = useState<string>(initial.level);

  const [englishDisabled, setEnglishDisabled] = useState<boolean>(false);
  const [irishDisabled, setIrishDisabled] = useState<boolean>(true);

  const [filterQuery, setFilterQuery] = useState('')
  const [subjectComboboxOpen, setSubjectComboboxOpen] = useState(false);

  let tempSubject: string = subject;
  let tempYear: string = year;

  type ExamPaper = {
    details: string;
    url: string;
  };

  determineLevelAvailability()

  useEffect(() => {
    setSelectionArray([certificate, subject, year, language, level]);
    determineLanguageAvailability();
    determineLevelAvailability();
    if (!checkIfAllYears()) { grabExamUrls(certificate, subject, year, language, level) } else { handleAllYearOption() }

  }, [certificate, subject, year, language, level, englishDisabled, irishDisabled]);

  // Save to localStorage when selection changes
  useEffect(() => {
    saveSelection({
      cert: certificate,
      subject,
      year,
      level,
      lang: language,
    });
  }, [certificate, subject, year, language, level]);

  function addExamToList(subjectId: string, examName: string, examUrl: string, category: string, year: string) {
    let fullExamUrl: string = `${url}/${category}/${year}/${examUrl}`
    newExamList.push([category, data["subNumsToNames"][subjectId], examName, year, fullExamUrl])
  }

  function checkIfAllYears() {
    if (tempYear === "All Years") {
      return true;
    } else {
      return false;
    }
  }

  function grabExamUrls(cert: string, subjectId: string, year: string, language: string, level: string) {
    if (checkIfAllYears()) { return; }

    newExamList = [];

    if (englishDisabled) {
      setLanguage("IV");
    } else if (irishDisabled) {
      setLanguage("EV");
    }

    setSelectionArray([cert, subjectId, year, language, level]);

    let documentList = data[cert][subjectId][year];
    let categories = Object.keys(documentList);

    for (const cat of categories) {
      for (const doc of documentList[cat]) {
        let docName = doc["details"];
        let docUrl = doc["url"];

        let isCorrectLanguage = docName.includes(language)
        let materialKeywords = /(BV|File|Picture|Map|Source)/
        let isExamMaterial = (isCorrectLanguage || materialKeywords.test(docName));
        let isCorrectLevel = (docName.includes(level) || docName.includes("Common") || docName.includes("File"))
        let isNotFoundationFile = !(!(level == "Foundation") && docName.includes("Foundation") && docName.includes("File"));

        if (isExamMaterial && isCorrectLevel && isNotFoundationFile) {
          if ("exampapers" in documentList) {
            if (!(documentList["exampapers"].some((paperName: ExamPaper) => paperName.details.includes("Foundation") && !(docName.includes("Foundation")) && level == "Foundation"))) {
              addExamToList(subjectId, docName, docUrl, cat, year);
            }
          }
        }
      }
    }

    setExamPaperList(newExamList);
  }

  const handleLevelChange = (value: string) => {
    currentLevel = value;
    determineLevelAvailability();
    ensureSubjectHasLevel(currentLevel);
    setLevel(currentLevel)
    if (checkIfAllYears()) {
      handleAllYearOption();
    }
  }

  function handleAllYearOption() {
    newExamList = []

    if (englishDisabled) {
      setLanguage("IV");
    } else if (irishDisabled) {
      setLanguage("EV");
    }

    let documentList = data[certificate][subject];
    const years = Object.keys(documentList).reverse()

    for (const currentYear of years) {
      let currentYearList = documentList[currentYear];
      for (const cat of (Object.keys(currentYearList))) {
        for (const doc of currentYearList[cat]) {
          let docName = doc["details"];
          let docUrl = doc["url"];

          let catKeys = Object.keys(documentList[currentYear])
          let isCorrectLanguage = docName.includes(language)
          let materialKeywords = /(BV|File|Picture|Map|Source)/
          let isExamMaterial = (isCorrectLanguage || materialKeywords.test(docName));
          let isCorrectLevel = (docName.includes(currentLevel) || docName.includes("Common") || docName.includes("File"))
          let isNotFoundationFile = !(!(currentLevel == "Foundation") && docName.includes("Foundation") && docName.includes("File"));

          if (isExamMaterial && isCorrectLevel && isNotFoundationFile) {
            if (catKeys.includes("exampapers")) {
              if (!(currentYearList["exampapers"].some((paperName: ExamPaper) => paperName.details.includes("Foundation") && !(docName.includes("Foundation")) && currentLevel == "Foundation"))) {
                addExamToList(subject, docName, docUrl, cat, currentYear);
              }
            }
          }
        }
      }
    }

    setExamPaperList(newExamList);
  }

  function ensureSubjectHasLevel(curLevel: string) {
    if (curLevel === "Higher" && tempHigherDisabled) {
      currentLevel = "Ordinary";
      setLevel("Ordinary");
    } else if (curLevel === "Ordinary" && tempOrdinaryDisabled) {
      currentLevel = "Higher";
      setLevel("Higher");
    } else if (curLevel === "Foundation" && tempFoundationDisabled) {
      currentLevel = "Higher";
      setLevel("Higher");
    } else if (curLevel === "Common" && tempCommonDisabled) {
      currentLevel = "Higher";
      setLevel("Higher");
    } else {
      setLevel(curLevel);
    }
  }

  function determineLanguageAvailability() {
    if (checkIfAllYears()) { return; }

    try {
      const exampapers = data[certificate][subject][year]["exampapers"];
      setEnglishDisabled(true);
      setIrishDisabled(true);

      for (const doc of exampapers) {
        const docName = doc.details;
        if (docName.includes("EV")) {
          setEnglishDisabled(false);
        }
        if (docName.includes("IV")) {
          setIrishDisabled(false);
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  function determineLevelAvailability() {
    if (checkIfAllYears()) { return; }

    if ("exampapers" in data[certificate][tempSubject][tempYear]) {
      const exampapers = data[certificate][tempSubject][tempYear]["exampapers"];
      tempHigherDisabled = true;
      tempOrdinaryDisabled = true;
      tempFoundationDisabled = true;
      tempCommonDisabled = true;

      let testKeywords = /(Map|Illustration|Source)/

      for (const doc of exampapers) {
        const docName = doc.details;
        let isCommonMaterial = testKeywords.test(docName)

        if (!(isCommonMaterial)) {
          if (docName.includes("Higher")) {
            tempHigherDisabled = false;
          }
          if (docName.includes("Ordinary")) {
            tempOrdinaryDisabled = false;
          }
          if (docName.includes("Foundation")) {
            tempFoundationDisabled = false;
          }
          if (docName.includes("Common")) {
            tempCommonDisabled = false;
          }
        }
      }
    }
  }

  function handleYearChange(val: string) {
    tempYear = val;

    if (val === "All Years") {
      handleAllYearOption();
      setYear("All Years")
    } else {
      ensureSubjectHasLevel(currentLevel);
      setYear(tempYear);
    }
  }

  function handleCertChange(val: string) {
    setCertificate(val);
    determineLevelAvailability()
    ensureSubjectHasLevel(currentLevel);

    let firstAvailableSubject = Object.keys(data[val])[0];
    setSubject(firstAvailableSubject);

    let arrayOfYears = Object.keys(data[val][Object.keys(subNumsToNames)[0]]);
    let firstAvailableYear = arrayOfYears.at(-1) || '2021';
    setYear(firstAvailableYear);
  }

  function handleSubjectChange(val: string) {
    setSubject(val);
    tempSubject = val;
    let subjectContainsCurrentYear = data[certificate][val].hasOwnProperty(year)

    if (!subjectContainsCurrentYear) {
      const lastKey = Object.keys(data[certificate][val]).at(-1);
      if (lastKey) {
        tempYear = lastKey;
        setYear(lastKey);
      }
    }
    determineLevelAvailability();
    ensureSubjectHasLevel(currentLevel);
  }

  function yearChoiceLoad() {
    return Object.entries(data[certificate][subject]).map(([year]) => {
      if (data[certificate][subject].hasOwnProperty(year)) {
        return (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        );
      } else {
        return null;
      }
    }).reverse();
  }

  const uniqueSubNumsToNames: Record<string, string> = {};
  Object.entries(subNumsToNames).forEach(([id, subjectName]) => {
    if (!Object.values(uniqueSubNumsToNames).includes(subjectName as string) && data[certificate].hasOwnProperty(id)) {
      uniqueSubNumsToNames[id] = subjectName as string;
    }
  });

  const filteredSubjects =
    filterQuery === ''
      ? Object.entries(uniqueSubNumsToNames).sort((a, b) => a[1].localeCompare(b[1]))
      : Object.entries(uniqueSubNumsToNames).filter(([id, subjectName]) =>
        (subjectName as string).toLowerCase().includes(filterQuery.toLowerCase())
      ).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="space-y-4">
      {/* Certificate Selection */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Certificate
        </label>
        <Select value={certificate} onValueChange={handleCertChange}>
          <SelectTrigger className="w-full h-10 text-white bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800">
            <SelectValue>
              {certificate === "lc" ? "Leaving Certificate" : "Junior Certificate"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="lc" className="hover:bg-zinc-800 focus:bg-zinc-700">
              Leaving Certificate
            </SelectItem>
            <SelectItem value="jc" className="hover:bg-zinc-800 focus:bg-zinc-700">
              Junior Certificate
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subject Selection */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Subject
        </label>
        <Popover open={subjectComboboxOpen} onOpenChange={setSubjectComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={subjectComboboxOpen}
              className="w-full h-10 justify-between text-white bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
            >
              <span className="truncate">{subNumsToNames[subject]}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-zinc-900 border-zinc-700">
            <Command className="bg-zinc-900">
              <CommandInput
                placeholder="Search subjects..."
                className="h-9 text-white bg-zinc-900 border-none"
                value={filterQuery}
                onValueChange={setFilterQuery}
              />
              <CommandList className="bg-zinc-900 max-h-64">
                <CommandEmpty className="text-zinc-400 py-6 text-center text-sm">
                  No subjects found.
                </CommandEmpty>
                <CommandGroup className="bg-zinc-900">
                  {filteredSubjects.map(([subjectId, subjectName]) => (
                    <CommandItem
                      key={subjectId}
                      value={subjectName as string}
                      onSelect={() => {
                        handleSubjectChange(subjectId);
                        setSubjectComboboxOpen(false);
                        setFilterQuery('');
                      }}
                      className="text-white hover:bg-zinc-800 data-[selected=true]:bg-zinc-700"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          subject === subjectId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {subjectName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Year and Level Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Year
          </label>
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full h-10 text-white bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800">
              <SelectValue>{year}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-64 bg-zinc-900 border-zinc-700 text-white">
              <SelectItem value="All Years" className="hover:bg-zinc-800 focus:bg-zinc-700">
                All Years
              </SelectItem>
              {yearChoiceLoad()}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Level
          </label>
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full h-10 text-white bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800">
              <SelectValue>{level}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem
                value="Higher"
                disabled={tempHigherDisabled}
                className={cn(
                  "hover:bg-zinc-800 focus:bg-zinc-700",
                  tempHigherDisabled ? "text-zinc-600 line-through" : "text-white"
                )}
              >
                Higher
              </SelectItem>
              <SelectItem
                value="Ordinary"
                disabled={tempOrdinaryDisabled}
                className={cn(
                  "hover:bg-zinc-800 focus:bg-zinc-700",
                  tempOrdinaryDisabled ? "text-zinc-600 line-through" : "text-white"
                )}
              >
                Ordinary
              </SelectItem>
              <SelectItem
                value="Foundation"
                disabled={tempFoundationDisabled}
                className={cn(
                  "hover:bg-zinc-800 focus:bg-zinc-700",
                  tempFoundationDisabled ? "text-zinc-600 line-through" : "text-white"
                )}
              >
                Foundation
              </SelectItem>
              <SelectItem
                value="Common"
                disabled={tempCommonDisabled}
                className={cn(
                  "hover:bg-zinc-800 focus:bg-zinc-700",
                  tempCommonDisabled ? "text-zinc-600 line-through" : "text-white"
                )}
              >
                Common
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Language Toggle */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Language
        </label>
        <div className="flex rounded-md overflow-hidden border border-zinc-700">
          <Button
            onClick={() => setLanguage("EV")}
            type="button"
            variant="ghost"
            disabled={englishDisabled}
            className={cn(
              "flex-1 h-10 rounded-none border-0 text-sm",
              "disabled:opacity-50",
              language === "EV"
                ? "bg-zinc-700 text-white font-medium"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            English
          </Button>
          <div className="w-px bg-zinc-700" />
          <Button
            onClick={() => setLanguage("IV")}
            type="button"
            variant="ghost"
            disabled={irishDisabled}
            className={cn(
              "flex-1 h-10 rounded-none border-0 text-sm",
              "disabled:opacity-50",
              language === "IV"
                ? "bg-zinc-700 text-white font-medium"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            Irish
          </Button>
        </div>
      </div>
    </div>
  );
}
