"use client"
import AboutDialog from "./components/Dialogs/AboutDialog";
import ContactDialog from "./components/Dialogs/ContactDialog";
import ResourcesDialog from "./components/Dialogs/ResourcesDialog";
import ShareDialog from "./components/Dialogs/ShareDialog";
import Footer from "./components/Footer";
import ChoicesForm from "./components/Form";
import { useDialogs } from "./contexts/DialogContext";

export default function Home() {
    const { aboutIsOpen, contactIsOpen, shareIsOpen, resourcesIsOpen } = useDialogs();

    return (
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
                <ChoicesForm />
            </div>
            <div className="flex-grow mt-14" />
            <AboutDialog />
            <ContactDialog />
            <ShareDialog />
            <ResourcesDialog /> {/* TODO: Consolidate this into one component */}
            <Footer />
        </main>
    );
}
