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
import PaperGrid from './PaperGrid';
import { useExam } from "../contexts/ExamContext";

interface ChoicesFormProps {
    showPaperGrid?: boolean;
}

// INITIALISATION
var data = require('../files/data.json');
var subNumsToNames = data["subNumsToNames"]

const url: string = "https://www.examinations.ie/archive";

let certSet = "lc"
let subjectSet = "3"
let yearSet = "2025"
let levelSet = "Higher"
let langSet = "EV"

let newExamList: string[][];
let currentLevel: string = "Higher";

let tempHigherDisabled: boolean = false;
let tempOrdinaryDisabled: boolean = false;
let tempFoundationDisabled: boolean = false;
let tempCommonDisabled: boolean = false;


function ChoicesForm({ showPaperGrid = true }: ChoicesFormProps) {
    const searchQuery = useSearchParams();
    const { setSelectionArray, setExamPaperList } = useExam();

    if (searchQuery) {
        certSet = searchQuery.has("cert") ? searchQuery.get("cert") as string : "lc";
        subjectSet = searchQuery.has("subject") ? searchQuery.get("subject") as string : "3";
        yearSet = searchQuery.has("year") ? searchQuery.get("year") as string : "2025";
        levelSet = searchQuery.has("level") ? searchQuery.get("level") as string : "Higher";
        langSet = searchQuery.has("lang") ? searchQuery.get("lang") as string : "EV";
    }

    const [certificate, setCertificate] = useState<string>(certSet);
    const [subject, setSubject] = useState<string>(subjectSet);

    const [year, setYear] = useState<string>(yearSet);

    const [language, setLanguage] = useState<string>(langSet);
    const [level, setLevel] = useState<string>(levelSet);

    const [englishDisabled, setEnglishDisabled] = useState<boolean>(false);
    const [irishDisabled, setIrishDisabled] = useState<boolean>(true);

    const [examList, setExamList] = useState<string[][]>([]);
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

    // Returns a list of exam papers for a given subject, year, language, and level.
    function grabExamUrls(cert: string, subjectId: string, year: string, language: string, level: string) {

        if (checkIfAllYears()) { return; }

        newExamList = [];

        if (englishDisabled) {
            setLanguage("IV");
        } else if (irishDisabled) {
            setLanguage("EV");
        }

        setSelectionArray([cert, subjectId, year, language, level]);

        let documentList = data[cert][subjectId][year]; // Navigates to the specific subject and year.
        let categories = Object.keys(documentList); // exampapers, marking schemes, etc.

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
                    if ("exampapers" in documentList) { // Prevents the "exampapers" key from being accessed if it doesn't exist (edge cases)
                        if (!(documentList["exampapers"].some((paperName: ExamPaper) => paperName.details.includes("Foundation") && !(docName.includes("Foundation")) && level == "Foundation"))) { // Sorry if you're reading this. Fix to an obscure bug where Sound Files from both Higher/Ordinary and Foundation would be included when "Foundation" was selected.
                            addExamToList(subjectId, docName, docUrl, cat, year);
                        }
                    }
                }
            }
        }

        setExamList(newExamList);
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
                        if (catKeys.includes("exampapers")) { // Prevents the "exampapers" key from being accessed if it doesn't exist (edge cases)
                            if (!(currentYearList["exampapers"].some((paperName: ExamPaper) => paperName.details.includes("Foundation") && !(docName.includes("Foundation")) && currentLevel == "Foundation"))) { // Sorry if you're reading this. Fix to an obscure bug where Sound Files from both Higher/Ordinary and Foundation would be included when "Foundation" was selected.
                                addExamToList(subject, docName, docUrl, cat, currentYear);
                            }
                        }
                    }
                }
            }
        }

        setExamList(newExamList)
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

                if (!(isCommonMaterial)) { // Prevents common level material (e.g Maps in geography) from enabling Common level
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
            // If the selected year is invalid, update the year state
            const lastKey = Object.keys(data[certificate][val]).at(-1);
            if (lastKey) {
                tempYear = lastKey;
                setYear(lastKey);
            }
        }
        determineLevelAvailability();
        ensureSubjectHasLevel(currentLevel);
    }

    // Loads the year choices dependent on what subject is selected
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
        <>
            <form className='flex flex-row flex-wrap gap-3 w-auto justify-center hover:cursor-pointer'>

                <div className="w-80 justify-center sm:w-full sm:max-w-[460px] lg:w-56">
                    <Select value={certificate} onValueChange={handleCertChange}>
                        <SelectTrigger className="h-[52px] text-white text-left bg-zinc-900 border-2 border-[#303436] hover:border-[#494f52] hover:bg-[#494f52]">
                            <SelectValue>
                                {certificate === "lc" ? "Leaving Certificate" : "Junior Certificate"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-950 border-2 border-[#303436] text-white">
                            <SelectItem value="lc" className="hover:bg-zinc-800 focus:bg-zinc-800">
                                Leaving Certificate
                            </SelectItem>
                            <SelectItem value="jc" className="hover:bg-zinc-800 focus:bg-zinc-800">
                                Junior Certificate
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-80">
                    <Popover open={subjectComboboxOpen} onOpenChange={setSubjectComboboxOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={subjectComboboxOpen}
                                className="w-full h-[52px] justify-between text-white bg-zinc-900 border-2 border-[#303436] hover:bg-zinc-900 hover:border-[#494f52]"
                            >
                                {subNumsToNames[subject]}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 bg-gray-950 border-2 border-[#303436]">
                            <Command className="bg-gray-950">
                                <CommandInput 
                                    placeholder="Search subjects..." 
                                    className="h-9 text-white bg-gray-950 border-none"
                                    value={filterQuery}
                                    onValueChange={setFilterQuery}
                                />
                                <CommandList className="bg-gray-950">
                                    <CommandEmpty className="text-white py-6 text-center text-sm">
                                        No subjects found.
                                    </CommandEmpty>
                                    <CommandGroup className="bg-gray-950">
                                        {filteredSubjects.map(([subjectId, subjectName]) => (
                                            <CommandItem
                                                key={subjectId}
                                                value={subjectName as string}
                                                onSelect={() => {
                                                    handleSubjectChange(subjectId);
                                                    setSubjectComboboxOpen(false);
                                                    setFilterQuery('');
                                                }}
                                                className="text-white hover:bg-zinc-800 data-[selected=true]:bg-gray-700"
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


                <div className="w-32">
                    <Select value={year} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-[52px] text-white text-left bg-zinc-900 border-2 border-[#303436] hover:border-zinc-600">
                            <SelectValue>{year}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-64 bg-gray-950 border-2 border-[#303436] text-white">
                            <SelectItem value="All Years" className="hover:bg-zinc-800 focus:bg-gray-700">
                                All Years
                            </SelectItem>
                            {yearChoiceLoad()}
                        </SelectContent>
                    </Select>
                </div>

                <div className='w-40'>
                    <Select value={level} onValueChange={handleLevelChange}>
                        <SelectTrigger className="h-[52px] text-white text-left bg-zinc-900 border-2 border-[#303436] hover:border-zinc-600">
                            <SelectValue>{level}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-950 border-2 border-[#303436]">
                            <SelectItem 
                                value="Higher" 
                                disabled={tempHigherDisabled}
                                className={cn(
                                    "hover:bg-zinc-800 focus:bg-gray-700",
                                    tempHigherDisabled ? "text-red-500 bg-red-950/70 italic line-through" : "text-white"
                                )}
                            >
                                Higher
                            </SelectItem>
                            <SelectItem 
                                value="Ordinary" 
                                disabled={tempOrdinaryDisabled}
                                className={cn(
                                    "hover:bg-zinc-800 focus:bg-gray-700",
                                    tempOrdinaryDisabled ? "text-red-500 bg-red-950/70 italic line-through" : "text-white"
                                )}
                            >
                                Ordinary
                            </SelectItem>
                            <SelectItem 
                                value="Foundation" 
                                disabled={tempFoundationDisabled}
                                className={cn(
                                    "hover:bg-zinc-800 focus:bg-gray-700",
                                    tempFoundationDisabled ? "text-red-500 bg-red-950/70 italic line-through" : "text-white"
                                )}
                            >
                                Foundation
                            </SelectItem>
                            <SelectItem 
                                value="Common" 
                                disabled={tempCommonDisabled}
                                className={cn(
                                    "hover:bg-zinc-800 focus:bg-gray-700",
                                    tempCommonDisabled ? "text-red-500 bg-red-950/70 italic line-through" : "text-white"
                                )}
                            >
                                Common
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="inline-flex h-[52px]">
                    <Button 
                        onClick={() => setLanguage("EV")} 
                        type="button" 
                        variant="outline"
                        disabled={englishDisabled}
                        className={cn(
                            "h-full text-white border-2 rounded-r-none border-[#303436] hover:border-zinc-600",
                            "disabled:text-white/50 disabled:italic",
                            language === "EV" ? "bg-[#222222] font-bold" : "bg-zinc-900 font-normal hover:bg-zinc-800"
                        )}
                    >
                        English
                    </Button>
                    <Button 
                        onClick={() => setLanguage("IV")} 
                        type="button" 
                        variant="outline"
                        disabled={irishDisabled}
                        className={cn(
                            "h-full text-white border-2 rounded-l-none border-[#303436] hover:border-zinc-600",
                            "disabled:text-white/50 disabled:italic",
                            language === "IV" ? "bg-[#222222] font-bold" : "bg-zinc-900 font-normal hover:bg-zinc-800"
                        )}
                    >
                        Irish
                    </Button>
                </div>
            </form>

            {showPaperGrid && <PaperGrid examPaperList={examList} />}
        </>
    );

}

export default ChoicesForm;
