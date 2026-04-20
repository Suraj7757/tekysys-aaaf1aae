import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, User, Bot, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORT_WHATSAPP = "7319884599";
const SUPPORT_EMAIL = "krs715665@gmail.com";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today? You can ask about our features or contact support.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simple bot logic
    setTimeout(() => {
      let botResponse = "I'm a simplified assistant. For specialized help, please contact our support team.";
      const lowInput = input.toLowerCase();

      if (lowInput.includes("contact") || lowInput.includes("support") || lowInput.includes("help")) {
        botResponse = `You can reach our support team via WhatsApp at +91 ${SUPPORT_WHATSAPP} or email us at ${SUPPORT_EMAIL}.`;
      } else if (lowInput.includes("feature") || lowInput.includes("crm")) {
        botResponse = "MSM CRM provides Job Tracking, Inventory Management, Wallet Systems, and Referral programs for multi-service businesses.";
      } else if (lowInput.includes("price") || lowInput.includes("cost")) {
        botResponse = "Please check our Subscription page for the latest pricing plans and benefits.";
      }

      const botMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 sm:w-96 mb-4 shadow-2xl border-primary/10 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          <CardHeader className="gradient-primary p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">MSM Support Bot</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/70 font-medium">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-muted/30" ref={scrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  m.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                  m.sender === "bot" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {m.sender === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  m.sender === "bot" ? "bg-white text-foreground rounded-tl-none border border-black/5" : "bg-primary text-primary-foreground rounded-tr-none"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-3 bg-white border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
          <div className="px-4 py-2 bg-muted/50 border-t flex justify-center gap-4">
             <a href={`https://wa.me/91${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-muted-foreground hover:text-green-600 flex items-center gap-1 transition-colors">
               <Phone className="h-3 w-3" /> WhatsApp
             </a>
             <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
               <Mail className="h-3 w-3" /> Email
             </a>
          </div>
        </Card>
      )}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen ? "rotate-90 bg-destructive hover:bg-destructive" : "gradient-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
