import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogs } from "../../contexts/DialogContext";
import { useExam } from "../../contexts/ExamContext";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef, useCallback } from "react";
import sendWebhook from "../../scripts/discordWebhook";
import * as dotenv from "dotenv";

dotenv.config();
const WEBHOOK_URL = process.env.NEXT_PUBLIC_RESOURCES_WEBHOOK as string;

function ResourcesDialog() {
  const { resourcesIsOpen, setResourcesIsOpen } = useDialogs();
  const { selectionArray } = useExam();
  const fetchedSubjectNumberRef = useRef<string>("");

  var data = require("../../files/data.json");
  var subNumsToNames = data["subNumsToNames"];

  const subjectNumber = selectionArray[1];
  const subjectName = subNumsToNames[subjectNumber];

  const markdownPath = `/resources/${subjectNumber}.md`;
  const universalPath = "/resources/universal.md";

  const [markdownText, setMarkdownText] = useState("");

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const link = formData.get("link");

    if (link === "") {
      alert("Please include a link!");
      return;
    } else {
      const content = `**SUBJECT NUMBER:** ${subjectNumber}\n**SUBJECT NAME:** ${subjectName}\n**LINK:** ${link}`;
      const successMessage =
        "Thank you for your contribution. I'll review the link and add it if it's a good fit. :)";

      sendWebhook(content, successMessage, WEBHOOK_URL);
    }
  };

  const fetchMarkdownText = useCallback(async () => {
    try {
      const response = await fetch(markdownPath);
      const uResponse = await fetch(universalPath);
      const rText = await response.text();
      const uText = await uResponse.text();
      setMarkdownText(uText + rText + "---");
      if (rText === "") {
        setMarkdownText(uText + "No specific links for this subject found.");
      }
      fetchedSubjectNumberRef.current = subjectNumber;
    } catch (error) {
      setMarkdownText(
        "We ran into an error! Please contact me using the form in the footer. Thanks :)\n\n\n" +
          error
      );
    }
  }, [markdownPath, universalPath, subjectNumber]);

  useEffect(() => {
    if (fetchedSubjectNumberRef.current !== subjectNumber) {
      fetchMarkdownText();
    }
  }, [subjectNumber, fetchMarkdownText]);

  return (
    <Dialog open={resourcesIsOpen} onOpenChange={setResourcesIsOpen}>
      <DialogContent className="max-w-[36rem] p-8 rounded-2xl border-4 border-white bg-zinc-950 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            {subjectName} Resources
          </DialogTitle>
          <DialogDescription className="text-white">
            <span className="italic text-white/60">
              Feel free to contribute any links via the form below.
            </span>
            <div className="mt-6">
              <ReactMarkdown className="prose prose-p:-mt-4 prose-hr:my-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h3:text-lg prose-h3:font-bold prose-a:font-normal prose-a:text-white hover:prose-a:text-slate-300 prose-invert">
                {markdownText}
              </ReactMarkdown>
            </div>

            <form className="mt-6" onSubmit={handleFormSubmit}>
              <Label htmlFor="link" className="text-white">
                Contribute a Link:
              </Label>
              <div className="max-w-[36rem] mt-1 bg-zinc-900 border-2 py-1 px-2 rounded-md border-white items-center flex flex-row">
                <Input
                  type="text"
                  id="link"
                  name="link"
                  className="shrink w-0 h-full flex-1 truncate bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                />
                <Button
                  type="submit"
                  className="border-2 border-white p-2 rounded-md ml-2 bg-transparent hover:bg-white/10"
                >
                  Send
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>

        <Button
          onClick={() => setResourcesIsOpen(false)}
          variant="ghost"
          className="mt-4 hover:scale-105"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ResourcesDialog;
