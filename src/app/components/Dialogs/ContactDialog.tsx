import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useDialogs } from "../../contexts/DialogContext";
import sendWebhook from "../../scripts/discordWebhook";
import * as dotenv from 'dotenv';

dotenv.config()
const WEBHOOK_URL = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK as string;

function ContactDialog() {
  const { contactIsOpen, setContactIsOpen } = useDialogs();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const nameValue = formData.get("name");
    const emailValue = formData.get("email");
    const messageValue = formData.get("message");

    const content = `**NAME**: ${nameValue}\n**EMAIL**: ${emailValue}\n**MESSAGE**: ${messageValue}`
    const successMessage = "Your message has been sent succesfully. I'll try to get back to you soon."

    if (messageValue === "") {
      alert("Please include a message!");
      return;
    } else {
      sendWebhook(content, successMessage, WEBHOOK_URL)
    }
  }

  return (
    <AnimatePresence>
      {contactIsOpen && (
        <Dialog
          open={contactIsOpen}
          onClose={() => setContactIsOpen(false)}
          className="absolute z-50 w-full h-full"
        >

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center align-middle p-4">
                <Dialog.Panel className="w-[32rem] p-8 rounded-2xl border-4 border-white bg-zinc-950">
                  <Dialog.Title className="text-3xl font-bold">Contact</Dialog.Title>
                  <Dialog.Description>
                    <h1 className="font-bold mt-4">Want to reach out? Feedback is always appreciated.</h1>
                  </Dialog.Description>

                  <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col mt-4">

                      <label htmlFor="name" className="font-bold mb-2">Name</label>
                      <input type="text" name="name" id="name" className="rounded-md w-auto p-1 pl-2 mb-6 bg-zinc-900" />

                      <label htmlFor="email" className="font-bold mb-2">Email</label>
                      <input type="email" name="email" id="email" className="rounded-md w-auto p-1 pl-2 mb-6 bg-zinc-900" />

                      <label htmlFor="message" className="font-bold mb-2">Message</label>
                      <textarea name="message" id="message" className="rounded-md w-auto p-1 pl-2 mb-8 bg-zinc-900" />

                      <button
                        type="submit"
                        className="rounded-md p-1 bg-blue-500 text-white transition-all duration-300"
                      >
                        Submit
                      </button>
                    </div>

                  </form>

                  <button onClick={() => setContactIsOpen(false)} className="mt-4 rounded-md p-2 hover:scale-105">Close</button>
                </Dialog.Panel>
              </div>
            </div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default ContactDialog;
