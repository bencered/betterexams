'use client'
import { useExam } from "../../contexts/ExamContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function SplitIframeView() {
  const { currentExamUrl, currentMarkingSchemeUrl } = useExam();

  if (!currentExamUrl && !currentMarkingSchemeUrl) {
    return (
      <div className="flex items-center justify-center h-full text-white/70">
        <p>Select an exam to view papers</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Side-by-side */}
      <div className="hidden md:block h-full w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full w-full flex flex-col">
              <div className="bg-zinc-800 text-white p-2 pl-8 text-sm font-semibold border-b border-[#303436]">
                Exam Paper
              </div>
              {currentExamUrl ? (
                <iframe
                  src={currentExamUrl}
                  className="w-full h-full border-0"
                  title="Exam Paper"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  No exam paper available
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full w-full flex flex-col">
              <div className="bg-zinc-800 text-white p-2 text-sm font-semibold border-b border-[#303436]">
                Marking Scheme
              </div>
              {currentMarkingSchemeUrl ? (
                <iframe
                  src={currentMarkingSchemeUrl}
                  className="w-full h-full border-0"
                  title="Marking Scheme"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  No marking scheme available
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Stacked vertically */}
      <div className="md:hidden h-full w-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full w-full flex flex-col">
              <div className="bg-zinc-800 text-white p-2 text-sm font-semibold border-b border-[#303436]">
                Exam Paper
              </div>
              {currentExamUrl ? (
                <iframe
                  src={currentExamUrl}
                  className="w-full h-full border-0"
                  title="Exam Paper"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  No exam paper available
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full w-full flex flex-col">
              <div className="bg-zinc-800 text-white p-2 text-sm font-semibold border-b border-[#303436]">
                Marking Scheme
              </div>
              {currentMarkingSchemeUrl ? (
                <iframe
                  src={currentMarkingSchemeUrl}
                  className="w-full h-full border-0"
                  title="Marking Scheme"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  No marking scheme available
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
