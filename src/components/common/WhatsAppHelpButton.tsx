import { MessageCircle } from "lucide-react";

const ADMIN_WHATSAPP = "917319884599";
const DEFAULT_MESSAGE = "Hello Suraj, I need help with RepairDesk CRM";

export function WhatsAppHelpButton() {
  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`,
      "_blank",
    );
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center hover:scale-105 active:scale-95"
      aria-label="WhatsApp Help"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
