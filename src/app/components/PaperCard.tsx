import { AnimatePresence, motion } from "framer-motion";
import { useExam } from "../contexts/ExamContext";

interface PaperCardProps {
  type: string;
  subject: string;
  paperName: string;
  year: string;
  url: string;
}

function PaperCard({ type, subject, paperName, year, url }: PaperCardProps) {
  const { isCompact } = useExam();

  function determineCategoryName(catName: string) {
    let title: string;

    switch (catName) {
      case "exampapers":
        title = "Exam Paper"; break;

      case "markingschemes":
        title = "Marking Scheme"; break;

      case "deferredexams":
        title = "Deferred Exam"; break;

      case "deferredmarkingschemes":
        title = "Deferred Marking Scheme"; break;

      default:
        title = "Unknown";
    }

    return title;
  }

  function determineEmoji() {
    if (type.includes("marking")) {
      return "✏️ "
    } else if (paperName.includes("Paper") || paperName.includes("Part")) {
      return "📄 "
    } else if (paperName.includes("Map")) {
      return "🗺️ "
    } else if (paperName.includes("Picture")) {
      return "🖼️ "
    } else if (paperName.includes("Sound")) {
      return "💿 "
    } else {
      return "📄 "
    }
  }

  function determineCardColour(catName: string) {
    switch (catName) {
      case "exampapers":
        return "border-l-blue-500 shadow-[inset_14px_0_22px_-19px_rgba(59,130,246)] hover:border-l-blue-600";
      case "markingschemes":
        return "border-l-red-500 shadow-[inset_14px_0_22px_-19px_rgba(239,68,68)] hover:border-l-red-500";
      case "deferredexams":
        return "border-l-green-500 shadow-[inset_14px_0_22px_-19px_rgba(34,197,94)] hover:border-l-green-600";
      case "deferredmarkingschemes":
        return "border-l-yellow-300 shadow-[inset_14px_0_22px_-19px_rgba(253,224,74)] hover:border-l-yellow-400";
      default:
        return "border-l-slate-300 shadow-[inset_14px_0_22px_-19px_rgba(253,224,74)] hover:border-l-slate-400";
    }
  }

  if (isCompact) {
    return (
      <li>
        <a href={url} target="_blank" className="text-white underline">
          {determineCategoryName(type)} - {paperName}
        </a>
      </li>
    )
  } else {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0.7, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.35 }}
        >
          <a href={url} target="_blank">
            <div
              className={`group
                        w-auto h-auto min-w-[320px] min-h-[8rem lg:min-h-[9rem] border-l-8 p-3 rounded-lg text-white flex flex-col borderl-blue-500 justify-between group bg-[#222225]
                        ${determineCardColour(type)}
                        transform transition-all duration-[350ms] ease-in-out
                        hover:scale-105
                        sm:w-96
                        `}
            >
              <div>
                <h3>
                  {determineEmoji()} <span className="italic">{determineCategoryName(type)} • {subject}</span>
                </h3>
                <h1 className="text-2xl font-bold mt-1">
                  {paperName}
                </h1>
              </div>

              <div>
                <p className="font-mono italic text-slate-300 self-end">
                  {year}
                </p>
              </div>
            </div>
          </a>
        </motion.div>
      </AnimatePresence>
    );
  }
}

export default PaperCard;
