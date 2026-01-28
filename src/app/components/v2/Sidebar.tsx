'use client'
import { useState, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDialogs } from "../../contexts/DialogContext";
import { Button } from "@/components/ui/button";
import PaperTypeSelector from "./PaperTypeSelector";
import ExamSelectionForm from "./ExamSelectionForm";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setShareIsOpen, setResourcesIsOpen } = useDialogs();

  return (
    <aside
      className={`
        relative flex-shrink-0 bg-zinc-950 border-r border-zinc-800
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-12" : "w-80 lg:w-96"}
      `}
    >
      {/* Sidebar Content */}
      <div
        className={`
          h-full overflow-y-auto p-5
          ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
          transition-opacity duration-200
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Better Exams</h1>
          <p className="text-zinc-500 text-sm mt-1">
            An Alternative To Examinations.ie
          </p>
        </div>

        {/* Exam Selection Form */}
        <div className="space-y-5">
          <Suspense fallback={<div className="animate-pulse text-zinc-500">Loading...</div>}>
            <ExamSelectionForm />
          </Suspense>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Paper Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Paper
            </label>
            <PaperTypeSelector />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareIsOpen(true)}
              className="flex-1 text-zinc-300 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResourcesIsOpen(true)}
              className="flex-1 text-zinc-300 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              Resources
            </Button>
          </div>
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute top-4 right-0 translate-x-full
          flex items-center justify-center
          w-6 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-r-md
          text-zinc-400 hover:text-white transition-colors z-10
        `}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
