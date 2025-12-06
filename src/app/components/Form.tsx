/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { Combobox, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import PaperGrid from './PaperGrid';
import { useExam } from "../contexts/ExamContext";

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


function ChoicesForm() {
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
                    <Listbox.Option key={year} value={year} className={
                        `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem] pt-[0.5rem]
                        ui-active:bg-zinc-800 ui-not-active:bg-black`
                    }>
                        <span className="block truncate font-normal ui-selected:font-medium">
                            {year}
                        </span>
                        <span className="absolute hidden inset-y-0 left-0 items-center pl-3 text-zinc-200 ui-selected:flex">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    </Listbox.Option>
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
            ? Object.values(uniqueSubNumsToNames).sort()
            : Object.values(uniqueSubNumsToNames).filter((subjectName) =>
                (subjectName as string).toLowerCase().includes(filterQuery.toLowerCase())
            ).sort();



    return (
        <>
            <form className='flex flex-row flex-wrap gap-3 w-auto justify-center hover:cursor-pointer'>

                <div className="w-80 justify-center sm:w-full sm:max-w-[460px] lg:w-56">
                    <Listbox name="cert" value={certificate} onChange={handleCertChange}>
                        {({ open }) => (
                            <div className="relative">
                                <Listbox.Button className="text-white text-left bg-zinc-900 border-2 border-spacing-2 border-[#303436] w-full rounded-md p-3 hover:border-[#494f52] hover:bg-[#494f52] transition-all duration-200">
                                    {(certificate === "lc" ? "Leaving Certificate" : "Junior Certificate")}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>

                                <AnimatePresence>
                                    {open && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute w-full z-50"
                                        >
                                            <Listbox.Options static className="mt-2 z-50 h-full overflow-auto rounded-md bg-gray-950 border-2 border-[#303436] text-white">
                                                <Listbox.Option value="lc" className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem]
                                                    ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100`
                                                }>

                                                    <>
                                                        <span className="block truncate font-normal ui-selected:font-medium">
                                                            Leaving Certificate
                                                        </span>
                                                        <span className="absolute hidden inset-y-0 left-0 items-center pl-3 text-zinc-200 ui-selected:flex">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>

                                                <Listbox.Option value="jc" className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem]
                                                ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100`
                                                }>

                                                    <>
                                                        <span className="block truncate font-normal ui-selected:font-medium">
                                                            Junior Certificate
                                                        </span>
                                                        <span className="absolute hidden inset-y-0 left-0 items-center pl-3 text-zinc-200 ui-selected:flex">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>
                                            </Listbox.Options>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>

                        )}
                    </Listbox>
                </div>

                <div className="w-80">
                    <Combobox name="subject" value={subject} onChange={handleSubjectChange}>
                        {({ open }) => (
                            <div className="relative h-[52px]">
                                <div className="relative h-full w-full cursor-pointer overflow-hidden rounded-md text-left border-2 border-[#303436]">
                                    <Combobox.Input
                                        className="w-full h-full border-none pl-3 pr-10 leading-5 bg-zinc-900 text-white focus:ring-0"
                                        displayValue={() => subNumsToNames[subject]}
                                        onChange={(event) => setFilterQuery(event.target.value)}
                                        aria-label="subjects"
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2" aria-label="expand subjects">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </Combobox.Button>
                                </div>

                                <AnimatePresence>
                                    {open && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute w-full z-50"
                                        >
                                            <Combobox.Options static className="mt-2 z-50 py-2 w-full h-full max-h-72 overflow-auto rounded-md bg-gray-950 border-2 appearance-none border-[#303436] text-white">
                                                {filteredSubjects.length === 0 && filterQuery !== "" ? (
                                                    <div className="relative cursor-default select-none py-2 px-4 text-white">
                                                        No subjects found.
                                                    </div>
                                                ) : (
                                                    filteredSubjects.map((subjectName) => {
                                                        const subjectId = Object.keys(subNumsToNames).find(
                                                            (id) => subNumsToNames[id] === subjectName
                                                        );

                                                        if (subjectId) {
                                                            return (
                                                                <Combobox.Option
                                                                    key={subjectId}
                                                                    value={subjectId}
                                                                    className="top-0 relative pl-10 ui-selected:bg-gray-700 py-2 ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100"
                                                                >
                                                                    {subjectName}
                                                                    <span className="absolute hidden inset-y-0 left-0 items-center pl-3 text-zinc-200 ui-selected:flex">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                </Combobox.Option>
                                                            );
                                                        }
                                                    })
                                                )}
                                            </Combobox.Options>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </Combobox>
                </div>


                <div className="w-32">
                    <Listbox name="year" value={year} onChange={handleYearChange}>
                        {({ open }) => (
                            <div className="relative">
                                <Listbox.Button className="text-white text-left bg-zinc-900 border-2 border-spacing-2 border-[#303436] w-full rounded-md p-3 hover:border-slate-400 transition-all duration-200">
                                    {year}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>

                                <AnimatePresence>
                                    {open && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "16rem" }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute w-full z-50"
                                        >
                                            <Listbox.Options static className="max-h-64 mt-2 border-2 h-full border-[#303436] overflow-auto z-50 w-full rounded-md bg-gray-950 text-white">
                                                <Listbox.Option key="allyears" value="All Years" className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem] pt-[0.5rem]
                                                ui-active:bg-zinc-800 ui-not-active:bg-black`
                                                }>
                                                    <span className="block truncate font-normal ui-selected:font-medium">
                                                        All Years
                                                    </span>
                                                    <span className="absolute hidden inset-y-0 left-0 items-center pl-3 text-zinc-200 ui-selected:flex">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </Listbox.Option>
                                                {yearChoiceLoad()}
                                            </Listbox.Options>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        )}
                    </Listbox>
                </div>

                <div className='w-40'>

                    <Listbox name="level" defaultValue={level} onChange={handleLevelChange}>
                        {({ open }) => (
                            <div className="relative">
                                <Listbox.Button className="text-white text-left bg-zinc-900 border-2 border-spacing-2 border-[#303436] w-full rounded-md p-3 hover:border-slate-400 transition-all duration-200">
                                    {level}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>

                                <AnimatePresence>
                                    {open && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute w-full z-50"
                                        >
                                            <Listbox.Options static className="mt-2 h-full overflow-y-auto rounded-md bg-gray-950 border-2 border-[#303436]">
                                                <Listbox.Option value="Higher" disabled={tempHigherDisabled} className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem] pt-[0.5rem]
                                                    ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100
                                                    ${tempHigherDisabled ? "text-red-500 !bg-red-950/70 italic line-through" : "text-white"}`
                                                }>

                                                    <>
                                                        <span className={`block truncate ${currentLevel === "Higher" ? "font-medium" : "font-normal"}`}>
                                                            Higher
                                                        </span>
                                                        <span className={`absolute inset-y-0 left-0 items-center pl-3 text-zinc-200 ${level === "Higher" ? "flex" : "hidden"}`}>
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>

                                                <Listbox.Option value="Ordinary" disabled={tempOrdinaryDisabled} className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem]
                                                    ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100
                                                    ${tempOrdinaryDisabled ? "text-red-500 !bg-red-950/70 italic line-through" : "text-white"}`
                                                }>

                                                    <>
                                                        <span className={`block truncate ${currentLevel === "Ordinary" ? "font-medium" : "font-normal"}`}>
                                                            Ordinary
                                                        </span>
                                                        <span className={`absolute inset-y-0 left-0 items-center pl-3 text-zinc-200 ${level === "Ordinary" ? "flex" : "hidden"}`}>
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>

                                                <Listbox.Option value="Foundation" disabled={tempFoundationDisabled} className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem]
                                                    ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100
                                                    ${tempFoundationDisabled ? "text-red-500 !bg-red-950/70 italic line-through" : "text-white"}`
                                                }>
                                                    <>
                                                        <span className={`block truncate ${currentLevel === "Foundation" ? "font-medium" : "font-normal"}`}>
                                                            Foundation
                                                        </span>
                                                        <span className={`absolute inset-y-0 left-0 items-center pl-3 text-zinc-200 ${level === "Foundation" ? "flex" : "hidden"}`}>
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>

                                                <Listbox.Option value="Common" disabled={tempCommonDisabled} className={
                                                    `top-0 relative pl-10 ui-selected:bg-gray-700 py-[0.3rem] pb-[0.6rem]
                                                    ui-active:bg-zinc-800 ui-not-active:bg-black text-red transition-all duration-100
                                                    ${tempCommonDisabled ? "text-red-500 !bg-red-950/70 italic line-through" : "text-white"}`
                                                }>
                                                    <>
                                                        <span className={`block truncate ${currentLevel === "Common" ? "font-medium" : "font-normal"}`}>
                                                            Common
                                                        </span>
                                                        <span className={`absolute inset-y-0 left-0 items-center pl-3 text-zinc-200 ${level === "Common" ? "flex" : "hidden"}`}>
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    </>
                                                </Listbox.Option>
                                            </Listbox.Options>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </Listbox>
                </div>

                <div className="inline-flex">
                    <button onClick={() => setLanguage("EV")} type="button" className={`text-white border-2 py-2 px-4 rounded-l
                    enabled:hover:bg-zinc-800 border-[#303436] hover:border-slate-400
                    disabled:text-slate-300 disabled:italic
                    ${language === "EV" ? "bg-[#222222] font-bold border-" : "bg-zinc-900 font-normal"}
                    `}
                        disabled={englishDisabled}>
                        English
                    </button>
                    <button onClick={() => setLanguage("IV")} type="button" className={`text-white border-2 py-2 px-4 rounded-r
                    enabled:hover:bg-zinc-800 border-[#303436] hover:border-slate-400
                    disabled:text-slate-300 disabled:italic
                    ${language === "IV" ? "bg-[#222222] font-bold" : "bg-zinc-900 font-normal"}
                    `}
                        disabled={irishDisabled}>
                        Irish
                    </button>
                </div>
            </form>

            <PaperGrid examPaperList={examList} />
        </>
    );

}

export default ChoicesForm;
