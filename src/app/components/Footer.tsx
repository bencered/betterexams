import { Button } from "@/components/ui/button";
import { useDialogs } from "../contexts/DialogContext";

function Footer() {
  const { setAboutIsOpen, setContactIsOpen } = useDialogs();

  return (
    <footer className="flex flex-col items-center w-96 mt-10 lg:mt-0">
      <div className="flex w-full flex-row flex-wrap items-center justify-center space-x-2 text-center text-xl sm:text-lg">
        <Button
          onClick={() => setAboutIsOpen(true)}
          variant="link"
          className="group cursor-pointer !bg-transparent text-blue-400 hover:text-blue-500 transition-all duration-300 p-0 h-auto"
        >
          <span className="flex flex-col">
            About
            <span className="block max-w-0 bg-blue-400 group-hover:max-w-full transition-all duration-300 h-0.5 group-hover:bg-blue-500"></span>
          </span>
        </Button>

        <p>•</p>

        <Button
          onClick={() => setContactIsOpen(true)}
          variant="link"
          className="group cursor-pointer !bg-transparent text-red-400 hover:text-red-500 transition-all duration-300 p-0 h-auto"
        >
          <span className="flex flex-col">
            Contact
            <span className="block max-w-0 bg-red-400 group-hover:max-w-full transition-all duration-300 h-0.5 group-hover:bg-red-500"></span>
          </span>
        </Button>

        <a
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          className="text-white hover:text-red-500 transition-all duration-300"
        >
          •
        </a>

        <a
          href="https://github.com/General-Mudkip/betterexams"
          target="_blank"
          className="group cursor-pointer text-green-400 hover:text-green-500"
        >
          <span className="flex flex-col">
            GitHub
            <span className="block max-w-0 bg-green-400 group-hover:max-w-full transition-all duration-300 h-0.5 group-hover:bg-green-500"></span>
          </span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
