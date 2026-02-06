import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDialogs } from "../../contexts/DialogContext";
import { useExam } from "../../contexts/ExamContext";

function ShareDialog() {
  const { shareIsOpen, setShareIsOpen } = useDialogs();
  const { selectionArray, examPaperList } = useExam();

  let shareUrl = `https://betterexams.ie?cert=${selectionArray[0]}&subject=${selectionArray[1]}&year=${selectionArray[2]}&lang=${selectionArray[3]}&level=${selectionArray[4]}`;

  function determineCategoryName(catName: string) {
    let title: string;

    switch (catName) {
      case "exampapers":
        title = "Exam Paper";
        break;

      case "markingschemes":
        title = "Marking Scheme";
        break;

      case "deferredexams":
        title = "Deferred Exam";
        break;

      case "deferredmarkingschemes":
        title = "Deferred Marking Scheme";
        break;

      default:
        title = "Unknown";
    }

    return title;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const copyButton = document.getElementById("copybutton");
        if (copyButton) {
          copyButton.textContent = "Copied!";

          setTimeout(() => {
            copyButton.textContent = "Copy";
          }, 1000);
        }
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard: ", error);
      });
  }

  function examListToString() {
    return examPaperList
      .map(
        (paper: string[]) =>
          `(${determineCategoryName(paper[0])}) ${paper[2]}: ${paper[4]}`
      )
      .join("\n\n");
  }

  return (
    <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
      <DialogContent className="max-w-[32rem] p-8 rounded-2xl border-4 border-white bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Share</DialogTitle>
          <DialogDescription className="flex flex-col text-white">
            <h3 className="text-sm text-white/70 italic">
              Want to share your current selection with someone else?
            </h3>
            <h2 className="mb-2 text-xl mt-4 text-white">Shareable Link:</h2>
            <div className="max-w-[36rem] bg-zinc-900 border-2 py-1 px-2 rounded-md border-white items-center flex flex-row">
              <span className="shrink w-0 flex-1 truncate">{shareUrl}</span>

              <Button
                className="border-2 border-white p-2 rounded-md ml-2 bg-transparent hover:bg-white/10"
                id="copybutton"
                onClick={() => copyToClipboard(shareUrl)}
              >
                Copy
              </Button>
            </div>

            <h2 className="mt-4 mb-2 text-xl text-white">
              Or alternatively, copy and paste this:
            </h2>
            <Textarea
              className="bg-zinc-900 text-white rounded-md p-2 border-2 border-white w-full h-48 resize-none"
              value={examListToString()}
              readOnly
            />
          </DialogDescription>
        </DialogHeader>

        <Button
          onClick={() => setShareIsOpen(false)}
          variant="ghost"
          className="mt-4 hover:scale-105"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
