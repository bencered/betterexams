import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDialogs } from "../../contexts/DialogContext";

function AboutDialog() {
  const { aboutIsOpen, setAboutIsOpen } = useDialogs();

  return (
    <Dialog open={aboutIsOpen} onOpenChange={setAboutIsOpen}>
      <DialogContent className="max-w-[32rem] p-8 rounded-2xl border-4 border-white bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">About</DialogTitle>
          <DialogDescription className="text-white">
            <h1 className="font-bold mt-4">What?</h1>
            <p className="indent-5">
              I created this site as an alternative to the official{" "}
              <a
                href="https://www.examinations.ie/"
                target="_blank"
                className="underline hover:decoration-2"
              >
                examinations.ie
              </a>{" "}
              website, which is an arguable affront to God. (It proudly
              displays an e-Government award from 2006. It is as old as I am.)
            </p>
            <h1 className="font-bold mt-4">Why?</h1>
            <p className="indent-5">
              The goal from the get-go was to, firstly, improve upon my web-dev
              skills, and secondly, to save those precious seconds you spend
              every day on that hellish site.
            </p>
            <h1 className="font-bold mt-4">Who?</h1>
            <p className="indent-5">
              This website was made by{" "}
              <a
                href="https://www.mudkip.live"
                target="_blank"
                className="underline hover:decoration-2"
              >
                Bence R
              </a>
              , with the initial inspiration and elements of the design coming
              from Thomas Forbes&apos; &ldquo;
              <a
                href="https://examfinder.ie/"
                target="_blank"
                className="underline hover:decoration-2"
              >
                examfinder.ie
              </a>
              &ldquo;. Many thanks to him for the advice and for allowing me to
              use his data.json file.
            </p>
            <h1 className="font-bold mt-4">
              <span className="text-[11px]">w</span>Sources
            </h1>
            <p className="indent-5">
              All exam papers are direct links to the official{" "}
              <a
                href="https://www.examinations.ie/"
                target="_blank"
                className="underline hover:decoration-2"
              >
                examinations.ie
              </a>{" "}
              website. I do not claim ownership of any of the papers, nor do I
              claim to be affiliated with the State Examinations Commission. I
              am not affiliated with any of the links that may be present in
              the resources section.
            </p>
          </DialogDescription>
        </DialogHeader>

        <Button
          onClick={() => setAboutIsOpen(false)}
          variant="ghost"
          className="mt-4 rounded-md p-2 hover:scale-105"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default AboutDialog;
