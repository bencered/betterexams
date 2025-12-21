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
import { Textarea } from "@/components/ui/textarea";
import { useDialogs } from "../../contexts/DialogContext";
import sendWebhook from "../../scripts/discordWebhook";
import * as dotenv from "dotenv";

dotenv.config();
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

    const content = `**NAME**: ${nameValue}\n**EMAIL**: ${emailValue}\n**MESSAGE**: ${messageValue}`;
    const successMessage =
      "Your message has been sent succesfully. I'll try to get back to you soon.";

    if (messageValue === "") {
      alert("Please include a message!");
      return;
    } else {
      sendWebhook(content, successMessage, WEBHOOK_URL);
    }
  };

  return (
    <Dialog open={contactIsOpen} onOpenChange={setContactIsOpen}>
      <DialogContent className="max-w-[32rem] p-8 rounded-2xl border-4 border-white bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Contact</DialogTitle>
          <DialogDescription className="text-white">
            <h1 className="font-bold mt-4">
              Want to reach out? Feedback is always appreciated.
            </h1>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
          <div className="flex flex-col mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">
                Name
              </Label>
              <Input
                type="text"
                name="name"
                id="name"
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                id="email"
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-bold">
                Message
              </Label>
              <Textarea
                name="message"
                id="message"
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Submit
            </Button>
          </div>
        </form>

        <Button
          onClick={() => setContactIsOpen(false)}
          variant="ghost"
          className="mt-4 hover:scale-105"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
