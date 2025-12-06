import PaperCard from "./PaperCard";
import { useDialogs } from "../contexts/DialogContext";
import { useExam } from "../contexts/ExamContext";

interface PaperGridProps {
  examPaperList: string[][];
}

function PaperGrid({ examPaperList }: PaperGridProps) {
  const { setShareIsOpen, setResourcesIsOpen } = useDialogs();
  const { isCompact, setIsCompact } = useExam();

  const years: string[] = [];
  for (const element of examPaperList) {
    const year = element[3]
    if (!(years.includes(year))) {
      years.push(year);
    }
  }

  if (years.length == 1) {
    const deferredPapers = examPaperList.filter((paper) =>
      paper[0].includes("deferred")
    );
    const nonDeferredPapers = examPaperList.filter(
      (paper) => !paper[0].includes("deferred")
    );

    return (
      <div className="justify-center items-center flex flex-col">

        <hr className="block mt-6 mb-4 border-white/50 border-dashed h-[1px] w-full" />

        <div className="flex flex-row flex-wrap gap-x-4 justify-center">
          <button
            className="mb-5 whitespace-nowrap w-min
                    bg-zinc-900 p-3 rounded-lg border-[#303436] border-2 text-white            
                    "
            onClick={() => setShareIsOpen(true)}
          >
            Share Links
          </button>

          <button
            className="mb-5 whitespace-nowrap w-min
                    bg-zinc-900 p-3 rounded-lg border-[#303436] border-2 text-white            
                    "
            onClick={() => setResourcesIsOpen(true)}
          >
            {examPaperList[0][1]} Resources
          </button>

          <div className="flex mb-5 items-center text-white">
            <input
              type="checkbox"
              checked={isCompact}
              onChange={() => setIsCompact(!isCompact)}
              className="flex h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-[#303436] transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
              id="compactModeCheckbox"
            />
            <label
              htmlFor="compactModeCheckbox"
              className="ml-2"
            >
              Compact Mode?
            </label>
          </div>
        </div>
        {
          nonDeferredPapers.length > 0 && !isCompact && (
            <div className="flex flex-row flex-wrap gap-8 justify-center">
              {nonDeferredPapers.map((paper, index) => (
                <PaperCard
                  key={
                    paper[0] +
                    paper[1] +
                    paper[2] +
                    paper[3] +
                    index
                  }
                  type={paper[0]}
                  subject={paper[1]}
                  paperName={paper[2]}
                  year={paper[3]}
                  url={paper[4]}
                />
              ))}
            </div>
          )
        }

        {
          nonDeferredPapers.length > 0 && isCompact && (
            <div className="justify-center">
              {nonDeferredPapers.map((paper, index) => (
                <PaperCard
                  key={
                    paper[0] +
                    paper[1] +
                    paper[2] +
                    paper[3] +
                    index
                  }
                  type={paper[0]}
                  subject={paper[1]}
                  paperName={paper[2]}
                  year={paper[3]}
                  url={paper[4]}
                />
              ))}
            </div>
          )
        }

        {
          deferredPapers.length > 0 && !isCompact && (
            <>
              <div className="flex flex-row flex-wrap gap-8 mt-12 justify-center">
                {deferredPapers.map((paper, index) => (
                  <PaperCard
                    key={
                      paper[0] +
                      paper[1] +
                      paper[2] +
                      paper[3] +
                      index
                    }
                    type={paper[0]}
                    subject={paper[1]}
                    paperName={paper[2]}
                    year={paper[3]}
                    url={paper[4]}
                  />
                ))}
              </div>
            </>
          )
        }

        {
          deferredPapers.length > 0 && isCompact && (
            <>
              <div className="justify-center mt-8">
                {deferredPapers.map((paper, index) => (
                  <PaperCard
                    key={
                      paper[0] +
                      paper[1] +
                      paper[2] +
                      paper[3] +
                      index
                    }
                    type={paper[0]}
                    subject={paper[1]}
                    paperName={paper[2]}
                    year={paper[3]}
                    url={paper[4]}
                  />
                ))}
              </div>
            </>
          )
        }
      </div >
    );
  } else {
    if (isCompact) {
      return (
        <div>
          <div className="flex mt-5 items-center justify-center text-white">
            <input
              type="checkbox"
              checked={isCompact}
              onChange={() => setIsCompact(!isCompact)}
              className="flex h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-[#303436] transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
              id="compactModeCheckbox"
            />
            <label
              htmlFor="compactModeCheckbox"
              className="ml-2"
            >
              Compact Mode?
            </label>
          </div>
          <div className="justify-center max-w-[85rem]">
            {
              years.map((yr: string) => (
                <div className="flex flex-col flex-wrap" key={yr}>
                  <h1 className="text-white text-3xl ml-4 mt-6">{yr}</h1>
                  <hr />
                  <div className=" mt-8 justify-center">
                    {
                      examPaperList.filter((paper) => paper[3].includes(yr)).map((paper, index) => (
                        <PaperCard
                          key={
                            paper[0] +
                            paper[1] +
                            paper[2] +
                            paper[3] +
                            index
                          }
                          type={paper[0]}
                          subject={paper[1]}
                          paperName={paper[2]}
                          year={paper[3]}
                          url={paper[4]}
                        />

                      ))
                    }
                  </div>
                </div>

              )
              )
            }
          </div>
        </div >
      )

    } else {
      return (
        <div>
          <div className="flex mt-5 items-center justify-center text-white">
            <input
              type="checkbox"
              checked={isCompact}
              onChange={() => setIsCompact(!isCompact)}
              className="flex h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-[#303436] transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
              id="compactModeCheckbox"
            />
            <label
              htmlFor="compactModeCheckbox"
              className="ml-2"
            >
              Compact Mode?
            </label>
          </div>
          <div className="justify-center max-w-[85rem]">
            {
              years.map((yr: string) => (
                <div className="flex flex-col flex-wrap" key={yr}>
                  <h1 className="text-white text-3xl ml-4 mt-6">{yr}</h1>
                  <hr />
                  <div className="flex flex-row flex-wrap gap-8 mt-8 justify-center">
                    {
                      examPaperList.filter((paper) => paper[3].includes(yr)).map((paper, index) => (
                        <PaperCard
                          key={
                            paper[0] +
                            paper[1] +
                            paper[2] +
                            paper[3] +
                            index
                          }
                          type={paper[0]}
                          subject={paper[1]}
                          paperName={paper[2]}
                          year={paper[3]}
                          url={paper[4]}
                        />

                      ))
                    }
                  </div>
                </div>
              )
              )
            }
          </div >
        </div>
      )
    }
  }
}

export default PaperGrid;
