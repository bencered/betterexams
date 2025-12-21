"use client"
import { Monitor } from "lucide-react";
import { useDialogs } from "../contexts/DialogContext";
import { useExam } from "../contexts/ExamContext";
import Sidebar from "../components/v2/Sidebar";
import SplitIframeView from "../components/v2/SplitIframeView";
import AudioPlayer from "../components/AudioPlayer";
import AboutDialog from "../components/Dialogs/AboutDialog";
import ContactDialog from "../components/Dialogs/ContactDialog";
import ResourcesDialog from "../components/Dialogs/ResourcesDialog";
import ShareDialog from "../components/Dialogs/ShareDialog";

export default function V2Page() {
  const { aboutIsOpen, contactIsOpen, shareIsOpen, resourcesIsOpen } = useDialogs();
  const { currentAudioUrl } = useExam();

  const isDialogOpen = aboutIsOpen || contactIsOpen || shareIsOpen || resourcesIsOpen;

  return (
    <>
      {/* Mobile Not Supported Message */}
      <div className="fixed inset-0 z-50 md:hidden bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
        <Monitor className="w-16 h-16 text-zinc-600 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">Desktop Only</h1>
        <p className="text-zinc-400 max-w-sm">
          This page is optimized for desktop viewing. Please visit on a larger screen for the best experience.
        </p>
        <a
          href="/"
          className="mt-6 text-sm text-zinc-500 hover:text-white underline underline-offset-4"
        >
          Go to mobile-friendly version
        </a>
      </div>

      {/* Desktop View */}
      <div className={`h-screen flex overflow-hidden bg-black ${isDialogOpen ? "blur" : ""}`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Audio Player - at the very top */}
          <AudioPlayer audioUrl={currentAudioUrl} />

          {/* Split Iframe View */}
          <div className="flex-1 overflow-hidden">
            <SplitIframeView />
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <AboutDialog />
      <ContactDialog />
      <ShareDialog />
      <ResourcesDialog />
    </>
  );
}
