import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useDialogs } from "../../contexts/DialogContext";
import { useExam } from "../../contexts/ExamContext";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef, useCallback } from "react";
import sendWebhook from "../../scripts/discordWebhook"
import * as dotenv from 'dotenv';

dotenv.config()
const WEBHOOK_URL = process.env.NEXT_PUBLIC_RESOURCES_WEBHOOK as string;

function ResourcesDialog() {
    const { resourcesIsOpen, setResourcesIsOpen } = useDialogs();
    const { selectionArray } = useExam();
    const fetchedSubjectNumberRef = useRef<string>("");

    var data = require('../../files/data.json');
    var subNumsToNames = data["subNumsToNames"]

    const subjectNumber = selectionArray[1]
    const subjectName = subNumsToNames[subjectNumber]

    const markdownPath = `/resources/${subjectNumber}.md`
    const universalPath = "/resources/universal.md"

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
            const content = `**SUBJECT NUMBER:** ${subjectNumber}\n**SUBJECT NAME:** ${subjectName}\n**LINK:** ${link}`
            const successMessage = "Thank you for your contribution. I'll review the link and add it if it's a good fit. :)"

            sendWebhook(content, successMessage, WEBHOOK_URL)
        }
    }

    const fetchMarkdownText = useCallback(async () => {
        try {
            const response = await fetch(markdownPath)
            const uResponse = await fetch(universalPath)
            const rText = await response.text()
            const uText = await uResponse.text()
            setMarkdownText(uText + rText + "---")
            if (rText === "") {
                setMarkdownText(uText + "No specific links for this subject found.")
            }
            fetchedSubjectNumberRef.current = subjectNumber
        } catch (error) {
            setMarkdownText("We ran into an error! Please contact me using the form in the footer. Thanks :)\n\n\n" + error)
        }
    }, [markdownPath, universalPath, subjectNumber]);

    useEffect(() => {
        if (fetchedSubjectNumberRef.current !== subjectNumber) {
            fetchMarkdownText()
        }
    }, [subjectNumber, fetchMarkdownText]);

    return (
        <AnimatePresence>
            {resourcesIsOpen && (
                <Dialog
                    open={resourcesIsOpen}
                    onClose={() => setResourcesIsOpen(false)}
                    className="absolute z-50 w-full h-full"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Dialog.Panel className="w-[36rem] p-8 rounded-2xl border-4 border-white bg-zinc-950">
                                    <Dialog.Title className="text-3xl font-bold">{subjectName} Resources</Dialog.Title>
                                    <Dialog.Description>
                                        <span className="italic text-slate-400">Feel free to contribute any links via the form below.</span>
                                        <div className="mt-6">
                                            <ReactMarkdown className="prose prose-p:-mt-4 prose-hr:my-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h3:text-lg prose-h3:font-bold prose-a:font-normal prose-a:text-white hover:prose-a:text-slate-300 prose-invert">
                                                {markdownText}
                                            </ReactMarkdown>
                                        </div>

                                        <form className="mt-6" onSubmit={handleFormSubmit}>
                                            <label htmlFor="link">Contribute a Link:</label>
                                            <div className="max-w-[36rem] mt-1 bg-zinc-900 border-2 py-1 px-2 rounded-md border-white items-center flex flex-row">
                                                <input type="text" id="link" name="link" className="shrink w-0 h-full flex-1 truncate bg-transparent" />
                                                <button className="border-2 border-white p-2 rounded-md ml-2" id="copybutton" >
                                                    Send
                                                </button>
                                            </div>
                                        </form>

                                    </Dialog.Description>

                                    <button onClick={() => setResourcesIsOpen(false)} className="mt-4 rounded-md p-2 hover:scale-105">Close</button>
                                </Dialog.Panel>
                            </div>
                        </div>
                    </motion.div>
                </Dialog>

            )}
        </AnimatePresence>
    );
}

export default ResourcesDialog;
