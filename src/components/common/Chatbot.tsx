import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, User, Bot, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { store } from "@/lib/store";

const SUPPORT_WHATSAPP = "7319884599";
const SUPPORT_EMAIL = "krs715665@gmail.com";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type ChatState = "IDLE" | "AWAITING_DEVICE" | "AWAITING_ISSUE" | "AWAITING_CUSTOMER_NAME" | "AWAITING_CUSTOMER_MOBILE";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>("IDLE");
  const [tempJob, setTempJob] = useState<{deviceBrand?: string, deviceModel?: string, problemDescription?: string, customerName?: string, customerMobile?: string}>({});
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Namaste! 🙏 Mai MSM CRM bot hu. Mai aapki job status check kar sakta hu, nayi job create karne me madad kar sakta hu, ya service/pricing ki info de sakta hu. Boliye kaise help karu?",
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

    const userText = input.trim();
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      let botResponse = "";
      const lowInput = userText.toLowerCase();

      // State Machine for Job Creation
      if (chatState === "AWAITING_DEVICE") {
        setTempJob({ ...tempJob, deviceBrand: userText, deviceModel: "Unknown" });
        botResponse = "Theek hai. Ab device me kya problem (issue) aa rahi hai vo bataiye?";
        setChatState("AWAITING_ISSUE");
      } else if (chatState === "AWAITING_ISSUE") {
        setTempJob({ ...tempJob, problemDescription: userText });
        botResponse = "Got it! Customer ka naam kya hai?";
        setChatState("AWAITING_CUSTOMER_NAME");
      } else if (chatState === "AWAITING_CUSTOMER_NAME") {
        setTempJob({ ...tempJob, customerName: userText });
        botResponse = "Bas ek aakhiri cheez, customer ka 10-digit mobile number bata dijiye.";
        setChatState("AWAITING_CUSTOMER_MOBILE");
      } else if (chatState === "AWAITING_CUSTOMER_MOBILE") {
        if (!/^\d{10}$/.test(userText.replace(/\D/g,''))) {
          botResponse = "Mobile number galat lag raha hai. Kripya sahi 10-digit number enter karein.";
        } else {
          const mobile = userText.replace(/\D/g,'');
          // Check or create customer
          let cust = store.findCustomerByMobile(mobile);
          if (!cust) {
            cust = { id: Math.random().toString(36).substr(2,9), name: tempJob.customerName || 'Unknown', mobile, createdAt: new Date().toISOString().split('T')[0] };
            store.addCustomer(cust);
          }
          // Create job
          const jobId = store.nextJobId();
          store.addJob({
            id: Math.random().toString(36).substr(2,9),
            jobId,
            customerId: cust.id,
            customerName: cust.name,
            customerMobile: cust.mobile,
            deviceBrand: tempJob.deviceBrand || 'Unknown',
            deviceModel: 'Unknown',
            problemDescription: tempJob.problemDescription || 'Unknown',
            status: 'Received',
            estimatedCost: 0,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            technicianName: 'Unassigned'
          });
          
          botResponse = `Success! 🎉 Nayi job create ho gayi hai. Job Tracking ID hai: ${jobId}. Kuch aur help chahiye?`;
          setChatState("IDLE");
          setTempJob({});
        }
      } 
      // Main Intent Matching (IDLE State)
      else {
        // 1. Check Job Status (Matches REP-XXXX or SELL-XXXX)
        const trackMatch = userText.match(/(REP|SELL)-\d+/i);
        if (trackMatch) {
          const trackId = trackMatch[0].toUpperCase();
          const jobs = store.getJobs();
          const job = jobs.find(j => j.jobId === trackId);
          if (job) {
            botResponse = `Aapki Job ID ${trackId} ka status hai: *${job.status}*. (Device: ${job.deviceBrand}, Issue: ${job.problemDescription}). \nEstimated Cost: ₹${job.estimatedCost}`;
          } else {
            botResponse = `Sorry, mujhe ${trackId} se koi job nahi mili. Kripya sahi ID check karein.`;
          }
        }
        // 2. Create Job Intent
        else if (lowInput.includes("create job") || lowInput.includes("new job") || lowInput.includes("nayi job") || lowInput.includes("add job")) {
          botResponse = "Zaroor! Nayi job create karne ke liye, sabse pehle device ka brand aur type bataiye (e.g., Samsung Mobile, HP Laptop).";
          setChatState("AWAITING_DEVICE");
        }
        // 3. Services Intent
        else if (lowInput.includes("service") || lowInput.includes("what do you do") || lowInput.includes("kya repair")) {
          botResponse = "Hum sabhi tarah ke devices repair karte hain: Mobiles, Laptops, Tablets, PCs, TVs, ACs, Fridges, aur Coolers. Naya repair job create karne ke liye 'Create Job' type karein.";
        }
        // 4. Price/Cost FAQ
        else if (lowInput.includes("price") || lowInput.includes("cost") || lowInput.includes("kitna paisa") || lowInput.includes("plan")) {
          botResponse = "Humare CRM ke plans: Free (10 jobs/daily), Pro (₹249/mo ya ₹1799/yr) aur 30-day free trial bhi available hai. System me check kar lijiye Subscription page par.";
        }
        // 5. Customer History
        else if (lowInput.includes("history") || lowInput.includes("customer history")) {
          botResponse = "Customer history dekhne ke liye 'Customers' tab me ja kar customer pe click karein. Ya fir mujhe unka mobile number batao agar unki current jobs dekhni hain (e.g. status 9876543210).";
        }
        else if (lowInput.match(/\d{10}/)) {
           const mobile = lowInput.match(/\d{10}/)?.[0];
           if (mobile) {
               const jobs = store.getJobs().filter(j => j.customerMobile === mobile);
               if (jobs.length > 0) {
                   botResponse = `Is number pe ${jobs.length} jobs hain. Latest job: ${jobs[jobs.length-1].jobId} (${jobs[jobs.length-1].status}).`;
               } else {
                   botResponse = "Is number se koi record nahi mila.";
               }
           }
        }
        // 6. Support / Help
        else if (lowInput.includes("contact") || lowInput.includes("support") || lowInput.includes("help") || lowInput.includes("madad")) {
          botResponse = `Aap hamari support team se WhatsApp (+91 ${SUPPORT_WHATSAPP}) ya Email (${SUPPORT_EMAIL}) pe baat kar sakte hain.`;
        }
        // Fallback
        else {
          botResponse = "Maaf karna, main samjha nahi. Aap tracking ID (jaise REP-0001) likh kar status check kar sakte ho, ya 'Create Job' bol kar nayi repair entry shuru kar sakte ho.";
        }
      }

      const botMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
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
                <CardTitle className="text-sm font-bold text-white">MSM AI Assistant</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/70 font-medium">Online (Hinglish Supported)</span>
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
                  m.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                  m.sender === "bot" ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
                )}>
                  {m.sender === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-[13px] shadow-sm leading-relaxed",
                  m.sender === "bot" ? "bg-white text-slate-700 rounded-tl-none border border-slate-100" : "bg-primary text-primary-foreground rounded-tr-none"
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
                placeholder="Message likhiye ya job ID type karein..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 text-[13px]"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full shadow-sm">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
          <div className="px-4 py-2 bg-slate-50 border-t flex justify-center gap-4">
             <a href={`https://wa.me/91${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-slate-500 hover:text-green-600 flex items-center gap-1.5 transition-colors">
               <Phone className="h-3 w-3" /> WhatsApp Support
             </a>
             <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[11px] font-medium text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
               <Mail className="h-3 w-3" /> Email Support
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

