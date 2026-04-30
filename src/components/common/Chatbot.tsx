import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, User, Bot, Phone, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const SUPPORT_WHATSAPP = "7319884599";
const SUPPORT_EMAIL = "krs715665@gmail.com";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! 🙏 Mai **RepairXpert AI Assistant** hu. Mai aapko mobile, laptop, AC, TV repair ke baare me suggestions de sakta hu, parts cost estimate kar sakta hu, ya CRM features samjha sakta hu.\n\n**Try karein:**\n- *Samsung M31 charging nahi ho raha*\n- *Laptop overheating fix kaise karu?*\n- *AC me gas refill ka kya cost hai?*",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Last 10 messages for context
    const history = [...messages, userMsg]
      .slice(-10)
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    let assistantText = "";
    const assistantId = crypto.randomUUID();

    const upsertAssistant = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId) {
          return prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m));
        }
        return [...prev, { id: assistantId, role: "assistant", content: assistantText }];
      });
    };

    try {
      abortRef.current = new AbortController();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Bahut zyada requests. Thodi der baad try karein.");
        } else if (resp.status === 402) {
          toast.error("AI credits khatam. Admin se contact karein.");
        } else {
          toast.error("AI assistant error.");
        }
        setIsStreaming(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Chat error:", e);
        toast.error("Connection error. Try again.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 sm:w-96 mb-4 shadow-2xl border-primary/10 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          <CardHeader className="gradient-primary p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">RepairXpert AI</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/70 font-medium">
                    {isStreaming ? "Soch raha hu..." : "Powered by AI"}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-slate-50" ref={scrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                    m.role === "assistant" ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
                  )}
                >
                  {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-2xl text-[13px] shadow-sm leading-relaxed",
                    m.role === "assistant"
                      ? "bg-white text-slate-700 rounded-tl-none border border-slate-100 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-900"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}
                >
                  {m.role === "assistant" ? <ReactMarkdown>{m.content || "…"}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
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
                placeholder="Apna repair sawal puchein..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="flex-1 h-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 text-[13px]"
              />
              <Button type="submit" size="icon" disabled={isStreaming || !input.trim()} className="h-10 w-10 shrink-0 rounded-full shadow-sm">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
          <div className="px-4 py-2 bg-slate-50 border-t flex justify-center gap-4">
            <a href={`https://wa.me/91${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-slate-500 hover:text-green-600 flex items-center gap-1.5 transition-colors">
              <Phone className="h-3 w-3" /> WhatsApp
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[11px] font-medium text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
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
