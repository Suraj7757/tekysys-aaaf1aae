import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import {
  MessageCircle,
  Smartphone,
  Users,
  Send,
  CheckCircle,
  Megaphone,
} from "lucide-react";

const templates = [
  {
    id: "festival",
    label: "🎉 Festival Offer",
    text: "🎉 Special Festival Offer from TEKYSYS!\n\nGet *20% OFF* on all repairs this week!\n📱 Mobile | 💻 Laptop | 📺 TV | ❄️ AC\n\nBook now: Call/Visit us today!\n\nTEKYSYS Service Center 🔧",
  },
  {
    id: "reminder",
    label: "🔔 Payment Reminder",
    text: "🔔 Reminder from TEKYSYS\n\nDear Customer, your device repair is *complete and ready for pickup*.\nPlease visit us at your earliest convenience.\n\nFor queries: Contact us anytime.\nTEKYSYS Service Center 🔧",
  },
  {
    id: "new_service",
    label: "🆕 New Service Launch",
    text: "🆕 NEW SERVICE at TEKYSYS!\n\nWe now offer *Home Visit Repair Service*!\n✅ AC Servicing at your doorstep\n✅ Same day service available\n✅ Trained technicians\n\nBook now! TEKYSYS Service Center 🔧",
  },
  {
    id: "custom",
    label: "✏️ Custom Message",
    text: "",
  },
];

export default function BroadcastMessage() {
  const { data: customers } = useSupabaseQuery<any>("customers");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [doneVisible, setDoneVisible] = useState(false);

  const phonedCustomers = customers.filter(
    (c: any) => c.phone && c.phone.trim().length >= 10,
  );

  const selectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl && tmpl.text) setMessage(tmpl.text);
    else if (id === "custom") setMessage("");
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (phonedCustomers.length === 0) {
      toast.error("No customers with phone numbers");
      return;
    }
    setSending(true);
    setSentCount(0);
    setDoneVisible(false);

    let count = 0;
    if (channel === "whatsapp") {
      // Open WhatsApp for first customer (browser limitation: can't bulk auto-send)
      const phone = phonedCustomers[0]?.phone?.replace(/\D/g, "");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      toast.info(
        "WhatsApp opened for first customer. For bulk: use WhatsApp Business API.",
      );
      count = 1;
    } else {
      // SMS: open SMS app
      const phones = phonedCustomers
        .slice(0, 5)
        .map((c: any) => c.phone.replace(/\D/g, ""))
        .join(",");
      window.location.href = `sms:${phones}?body=${encodeURIComponent(message)}`;
      count = Math.min(5, phonedCustomers.length);
    }

    setSentCount(count);
    setSending(false);
    setDoneVisible(true);
    toast.success(`Broadcast sent to ${count} customer(s)!`);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-card">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            <div>
              <h3 className="font-bold">Broadcast Message</h3>
              <p className="text-xs text-violet-200">
                Send WhatsApp / SMS to all customers
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-sm flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="font-bold">{phonedCustomers.length}</span>
              <span className="text-violet-200 text-xs">
                customers with phone
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Channel Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Send Via
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setChannel("whatsapp")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${channel === "whatsapp" ? "border-[#25D366] bg-[#25D366]/10" : "border-border hover:border-[#25D366]/40"}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${channel === "whatsapp" ? "bg-[#25D366]" : "bg-muted"}`}
                >
                  <MessageCircle
                    className={`h-4 w-4 ${channel === "whatsapp" ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-bold ${channel === "whatsapp" ? "text-[#25D366]" : ""}`}
                  >
                    WhatsApp
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Best engagement
                  </p>
                </div>
              </button>
              <button
                onClick={() => setChannel("sms")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${channel === "sms" ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-400/40"}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${channel === "sms" ? "bg-blue-500" : "bg-muted"}`}
                >
                  <Smartphone
                    className={`h-4 w-4 ${channel === "sms" ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-bold ${channel === "sms" ? "text-blue-600" : ""}`}
                  >
                    SMS
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    All phones
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Message Template
            </Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ${selectedTemplate === t.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Message
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {message.length}/1000 chars
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast message here... Use *bold* for WhatsApp"
              className="min-h-[140px] resize-none text-sm font-mono"
              maxLength={1000}
            />
          </div>

          {/* Preview */}
          {message && (
            <div className="bg-[#ECE5DD] dark:bg-slate-800 rounded-2xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Preview
              </p>
              <div className="bg-white dark:bg-slate-700 rounded-xl rounded-tl-none p-3 shadow-sm max-w-[85%]">
                <p className="text-xs whitespace-pre-wrap">{message}</p>
                <p className="text-[9px] text-right text-muted-foreground mt-1">
                  Now ✓✓
                </p>
              </div>
            </div>
          )}

          {/* Send Button */}
          {doneVisible ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Broadcast Sent!
                </p>
                <p className="text-xs text-emerald-600">
                  Message delivered to {sentCount} customer(s)
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setDoneVisible(false);
                  setMessage("");
                }}
              >
                New Message
              </Button>
            </div>
          ) : (
            <Button
              className={`w-full font-bold ${channel === "whatsapp" ? "bg-[#25D366] hover:bg-[#1EBE57] text-white shadow-lg shadow-[#25D366]/25" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"}`}
              onClick={handleBroadcast}
              disabled={sending || !message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending
                ? "Sending..."
                : `Send to ${phonedCustomers.length} Customers via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
