"use client"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import AboutDialog from "./components/Dialogs/AboutDialog";
import ContactDialog from "./components/Dialogs/ContactDialog";
import ResourcesDialog from "./components/Dialogs/ResourcesDialog";
import ShareDialog from "./components/Dialogs/ShareDialog";
import Footer from "./components/Footer";
import ChoicesForm from "./components/Form";
import { useDialogs } from "./contexts/DialogContext";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const { aboutIsOpen, contactIsOpen, shareIsOpen, resourcesIsOpen } = useDialogs();

    return (
        <>
            {/* V2 Banner - Desktop only */}
            <Link href="/v2" className="hidden w-screen md:flex items-center align-middle bg-blue-600">
                <div className="w-screen flex justify-center items-center text-white py-2.5 px-4 text-sm">
                    <Badge className="mr-2">NEW</Badge>
                    View exam papers and marking schemes side by side.
                    <span
                        className="ml-3 inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
                    >
                        Try v2
                        <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </Link>

            <main
                className={`min-h-screen h-full flex flex-col -mt-12 items-center p-24 lg:mt-0 transition-all duration-300
    ${aboutIsOpen || contactIsOpen || shareIsOpen || resourcesIsOpen
                        ? "blur"
                        : "blur-0"
                    }
`}
            >
                <h1 className="text-6xl font-bold text-center">Better Exams</h1>
                <h2 className="italic text-white/70 mt-1 text-center">
                    An Alternative To Examinations.ie
                </h2>
                <div className="text-slate-400 items-center h-full mt-8 md:mt-14">
                    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                        <ChoicesForm />
                    </Suspense>
                </div>
                <div className="flex-grow mt-14" />
                <AboutDialog />
                <ContactDialog />
                <ShareDialog />
                <ResourcesDialog /> {/* TODO: Consolidate this into one component */}
                <Footer />
            </main>
        </>
    );
}
