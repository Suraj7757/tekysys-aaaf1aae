import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, X, MessageSquare, Zap, Search, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your MSM AI Assistant. How can I help you manage your repair business today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiContent = "I'm not sure how to help with that specifically. Try asking about 'job status', 'create job', or 'reports'.";
      const upInput = input.toLowerCase();

      if (upInput.includes("status") || upInput.includes("track")) {
        aiContent = "You can check job status by going to the 'Repair Jobs' section or using our public 'Track Order' page. Would you like me to take you there?";
      } else if (upInput.includes("create") || upInput.includes("new job")) {
        aiContent = "To create a new job, click the '+' button in the sidebar or go to the 'Repair Jobs' page and click 'New Job'.";
      } else if (upInput.includes("service") || upInput.includes("catalog")) {
        aiContent = "Our service catalog includes Mobile, Laptop, TV, and more. You can manage them in the 'Services' section.";
      } else if (upInput.includes("revenue") || upInput.includes("profit") || upInput.includes("report")) {
        aiContent = "You can view detailed financial reports and analytics in the 'Reports' dashboard.";
      } else if (upInput.includes("hello") || upInput.includes("hi")) {
        aiContent = "Hi there! I'm ready to help. What's on your mind?";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const QuickAction = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <Button
      variant="outline"
      size="sm"
      className="text-[10px] h-7 gap-1 bg-background/50 backdrop-blur"
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-[320px] sm:w-[380px] h-[500px] shadow-2xl border-primary/20 flex flex-col overflow-hidden bg-background/95 backdrop-blur">
              <CardHeader className="gradient-primary text-primary-foreground py-4 px-6 shrink-0 space-y-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">MSM AI Assistant</CardTitle>
                      <Badge variant="secondary" className="bg-white/20 border-0 text-[9px] h-4">Online</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted rounded-tl-none border border-black/5'
                      )}>
                        {m.content}
                        <p className={cn("text-[9px] mt-1 opacity-50", m.role === 'user' ? 'text-right' : 'text-left')}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 border border-black/5">
                        <div className="flex gap-1">
                          <span className="w-1.2 h-1.2 bg-foreground/20 rounded-full animate-bounce" />
                          <span className="w-1.2 h-1.2 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.2 h-1.2 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="px-4 py-2 border-t bg-muted/30 shrink-0">
                <div className="flex flex-wrap gap-2">
                  <QuickAction icon={Search} label="Track Job" onClick={() => navigate('/track')} />
                  <QuickAction icon={PlusCircle} label="New Job" onClick={() => navigate('/jobs#new')} />
                  <QuickAction icon={Zap} label="Dashboard" onClick={() => navigate('/dashboard')} />
                </div>
              </div>

              <CardFooter className="p-4 border-t bg-background shrink-0">
                <form
                  className="flex w-full gap-2"
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                >
                  <Input
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 h-9 text-xs bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-primary-foreground relative transition-all duration-300",
          isOpen ? "bg-destructive rotate-90" : "gradient-primary"
        )}
      >
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-background rounded-full animate-pulse" />
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
