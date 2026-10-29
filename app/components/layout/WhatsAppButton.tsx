import { FaWhatsapp } from "react-icons/fa";
import { whatsappLink } from "@/lib/site";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hi VyxrLabs, I'd like to talk about a project.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with VyxrLabs on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-8px_rgb(37_211_102/0.6)] transition-transform duration-300 hover:scale-105"
    >
      <FaWhatsapp className="h-7 w-7" aria-hidden />
    </a>
  );
}
