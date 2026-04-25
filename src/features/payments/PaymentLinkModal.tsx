import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';
import { 
  Share2, MessageCircle, Smartphone, Copy, Download, 
  CheckCircle2, QrCode, Globe, Clock, IndianRupee,
  Zap, ShieldCheck
} from 'lucide-react';

interface PaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
}

export default function PaymentLinkModal({ open, onOpenChange, job }: PaymentLinkModalProps) {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');

  if (!job) return null;

  const amount = job.estimated_cost || 0;
  const upiId = job.upi_id || 'merchant@upi'; // Fallback if not set
  const shopName = 'TEKYSYS';

  // Standard UPI URI
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Job ' + job.job_id)}`;

  const generateLink = async () => {
    setLoading(true);
    try {
      // Check if link already exists
      const { data: existing } = await supabase
        .from('payment_links')
        .select('*')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        setLinkToken(existing.link_token);
      } else {
        const { data, error } = await supabase.from('payment_links').insert({
          job_id: jobId,
          user_id: user.id,
          amount,
          customer_name: customerName,
          customer_phone: customerPhone || '',
        }).select().single();
        if (error) throw error;
        setLinkToken(data.link_token);
      }
    } catch (e) {
      toast.error('Failed to generate link');
    }
    setGenerating(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast.success('Payment link copied!');
    setTimeout(() => setCopied(false), 2000);
    await logMessage('whatsapp', `Link copied for ${customerName}`);
  };

  const logMessage = async (type: 'whatsapp' | 'sms', content: string) => {
    if (!user) return;
    await supabase.from('message_logs').insert({
      user_id: user.id,
      job_id: jobId,
      customer_name: customerName,
      customer_phone: customerPhone || '',
      message_type: type,
      message_content: content,
      status: 'sent'
    });
  };

  const whatsappMsg = `🔧 *TEKYSYS Service Center*\nHi ${customerName} 👋\n\nYour device repair is ready! 🎉\nJob ID: *${jobId}*\n\n💳 *Payment Details:*\nAmount Due: *₹${amount.toLocaleString()}*\nPay Now: ${paymentUrl}\n\nScan QR or click the link to track & pay.\nThank you! 🙏`;

  const smsMsg = `TEKYSYS: Hi ${customerName}, your device repair is ready. Pay Rs.${amount}: ${paymentUrl} Job#${jobId}`;

  const sendWhatsApp = async () => {
    if (!linkToken) { toast.error('Generate link first'); return; }
    const url = `https://wa.me/${customerPhone ? customerPhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(whatsappMsg)}`;
    window.open(url, '_blank');
    await logMessage('whatsapp', whatsappMsg);
    toast.success('WhatsApp opened!');
  };

  const sendSMS = async () => {
    if (!linkToken) { toast.error('Generate link first'); return; }
    const url = `sms:${customerPhone || ''}?body=${encodeURIComponent(smsMsg)}`;
    window.location.href = url;
    await logMessage('sms', smsMsg);
    toast.success('SMS app opened!');
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      canvas.width = 300; canvas.height = 300;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, 300, 300);
      ctx!.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement('a');
      link.download = `Payment-QR-${jobId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    toast.success('QR Code downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Payment Link & Share
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-violet-100 text-sm">
                <User className="h-3.5 w-3.5" />
                <span>{customerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white font-black text-2xl">
                <IndianRupee className="h-5 w-5" />
                <span>{amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-0 text-xs">Job #{jobId}</Badge>
              <div className="flex items-center gap-1 text-violet-200 text-xs mt-1">
                <Clock className="h-3 w-3" />
                <span>Expires in 7 days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Generate Link */}
          {!linkToken ? (
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
              onClick={generateLink}
              disabled={generating}
            >
              <Link2 className="h-4 w-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Payment Link'}
            </Button>
          ) : (
            <>
              {/* Link Display */}
              <div className="flex items-center gap-2 bg-muted/50 border border-dashed border-violet-300 rounded-xl p-3">
                <Link2 className="h-4 w-4 text-violet-500 shrink-0" />
                <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{paymentUrl}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-violet-100" onClick={copyLink}>
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-violet-600" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-violet-100" onClick={() => window.open(paymentUrl, '_blank')}>
                    <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={sendWhatsApp}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/15 transition-all hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-[#25D366]">WhatsApp</span>
                </button>

                <button
                  onClick={sendSMS}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-blue-500/30 bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-600">SMS</span>
                </button>

                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-purple-500/30 bg-purple-50 hover:bg-purple-100 transition-all hover:scale-105"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    {copied ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5 text-white" />}
                  </div>
                  <span className="text-xs font-bold text-purple-600">Copy Link</span>
                </button>
              </div>

              {/* QR Code */}
              <div className="border rounded-2xl p-4 bg-gradient-to-b from-muted/30 to-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <QrCode className="h-4 w-4 text-violet-600" />
                  <span>QR Code — Scan to Pay / Track</span>
                </div>
                <div className="flex items-center gap-4">
                  <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-md border">
                    <QRCodeSVG value={paymentUrl} size={120} fgColor="#4f46e5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground">Customer can scan this QR to track order & pay online directly.</p>
                    <Button size="sm" variant="outline" className="w-full text-xs border-violet-300 text-violet-600 hover:bg-violet-50" onClick={downloadQR}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download QR PNG
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
