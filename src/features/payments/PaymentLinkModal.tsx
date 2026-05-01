import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Share2,
  MessageCircle,
  Smartphone,
  Copy,
  Download,
  CheckCircle2,
  QrCode,
  Globe,
  Clock,
  IndianRupee,
  Zap,
  ShieldCheck,
  Link2,
  Check,
  ExternalLink,
  User,
  AlertTriangle,
} from "lucide-react";

interface PaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
}

export default function PaymentLinkModal({
  open,
  onOpenChange,
  job,
}: PaymentLinkModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const [upiId, setUpiId] = useState(job?.upi_id || "");
  const [shopName, setShopName] = useState("TEKYSYS");

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("shop_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setUpiId(data.upi_id || "");
        setShopName(data.shop_name || "TEKYSYS");
      }
    };
    if (open) fetchSettings();
  }, [user, open]);

  if (!job) return null;

  const amount = job.estimated_cost || 0;
  const jobId = job.job_id || "N/A";
  const customerName = job.customer_name || "Customer";
  const customerMobile = job.customer_mobile || "";

  // Standard UPI URI for scanning
  const upiUri = `upi://pay?pa=${upiId || "merchant@upi"}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Job " + jobId)}`;

  const generateLink = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const trackingUrl = `${window.location.origin}/track?id=${jobId}`;

      // Save link to DB (optional tracking)
      await supabase.from("payment_links").insert({
        user_id: user.id,
        job_id: job.id,
        amount,
        status: "active",
        expires_at: new Date(
          Date.now() + parseInt(expiryDays) * 86400000,
        ).toISOString(),
      });

      setGeneratedLink(trackingUrl);
      toast.success("Payment Link Generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const logMessage = async (type: "whatsapp" | "sms") => {
    if (!user || !job) return;
    try {
      await supabase.from("message_logs").insert({
        user_id: user.id,
        job_id: jobId,
        customer_name: customerName,
        customer_phone: customerMobile,
        message_type: type,
        message_content: `Payment link shared via ${type}: ${generatedLink}`,
        status: "sent",
      } as any);
    } catch (err) {
      console.error("Failed to log message:", err);
    }
  };

  const shareWhatsApp = () => {
    const msg = `*Payment Request from ${shopName}*\n\nJob ID: *${jobId}*\nCustomer: ${customerName}\nAmount: *₹${amount}*\n\nPay securely using GPay, PhonePe or Paytm here:\n🔗 ${generatedLink}`;
    window.open(
      `https://wa.me/${customerMobile.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
    logMessage("whatsapp");
  };

  const shareSMS = () => {
    const msg = `Hi ${customerName}, Pay ₹${amount} for Job ${jobId} securely here: ${generatedLink} - ${shopName}`;
    window.open(
      `sms:${customerMobile.replace(/\D/g, "")}?body=${encodeURIComponent(msg)}`,
    );
    logMessage("sms");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(0, 0, 300, 300);
      ctx!.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement("a");
      link.download = `Payment-QR-${jobId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    toast.success("QR Code downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2 text-white">
              <QrCode className="h-6 w-6" /> Payment Link & QR
            </DialogTitle>
            <p className="text-violet-100 text-sm opacity-90">
              Collect payment for Job #{jobId}
            </p>
          </DialogHeader>

          <div className="mt-4 flex items-center justify-between bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {customerName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase">
                  Customer
                </p>
                <p className="text-sm font-bold">{customerName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white/70 uppercase">
                Amount Due
              </p>
              <p className="text-xl font-black text-white">
                ₹{amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
          {!generatedLink ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Link Expiry
                </Label>
                <select
                  className="w-full h-12 rounded-2xl border bg-muted/30 px-4 text-sm focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                >
                  <option value="1">1 Day</option>
                  <option value="7">7 Days (Recommended)</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              <Button
                onClick={generateLink}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-500/25 transition-all active:scale-95"
              >
                {loading ? "Generating..." : "Generate Smart Link"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                Safe & Secure Payment via UPI
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              {/* QR Code Section */}
              <div className="border rounded-3xl p-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-violet-600" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Scan to Pay
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-violet-600 hover:bg-violet-50 rounded-lg text-xs font-bold"
                    onClick={downloadQR}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download
                  </Button>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    ref={qrRef}
                    className="bg-white p-3 rounded-2xl shadow-xl border-4 border-violet-50 shrink-0"
                  >
                    <QRCodeSVG
                      value={upiUri}
                      size={130}
                      fgColor="#4f46e5"
                      includeMargin
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <img
                        src="https://img.icons8.com/color/48/google-pay-india.png"
                        className="h-6 w-6"
                        alt="GPay"
                      />
                      <img
                        src="https://img.icons8.com/color/48/phonepe.png"
                        className="h-6 w-6"
                        alt="PhonePe"
                      />
                      <img
                        src="https://img.icons8.com/color/48/paytm.png"
                        className="h-6 w-6"
                        alt="Paytm"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                      Customer can scan this QR with any UPI app to pay directly
                      to your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link Sharing */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Payment Link
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-muted/50 rounded-2xl border border-dashed border-violet-300 flex items-center px-4 overflow-hidden">
                    <span className="text-xs font-mono text-violet-600 truncate">
                      {generatedLink}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-12 w-12 rounded-2xl shrink-0"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareWhatsApp}
                  className="bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-2xl h-14 font-black shadow-lg shadow-emerald-500/20 gap-2 text-base"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl h-14 font-black gap-2 border-2 border-slate-200 hover:bg-slate-50 transition-all text-base"
                  onClick={shareSMS}
                >
                  <Smartphone className="h-5 w-5" /> Send SMS
                </Button>
              </div>

              {!upiId && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-start gap-3 animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      UPI ID NOT SET
                    </p>
                    <p className="text-[10px] text-amber-600 leading-tight">
                      You haven't configured your UPI ID in Shop Settings. QR
                      code will not work correctly.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[10px] text-amber-700 font-bold underline"
                      onClick={() => (window.location.href = "/settings")}
                    >
                      Configure Now →
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold leading-tight uppercase tracking-tight">
                  Secure & Encrypted. Payments go directly to your linked UPI
                  ID: {upiId || "Not Set"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
