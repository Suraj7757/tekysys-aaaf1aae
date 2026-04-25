import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/services/supabase';
import { Search, Smartphone, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { IndianRupee, QrCode as QrIcon, Copy, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusIcons: Record<string, any> = {
  'Received': Clock, 'In Progress': AlertTriangle, 'Ready': CheckCircle,
  'Delivered': CheckCircle, 'Rejected': XCircle, 'Unrepairable': XCircle,
  'Completed': CheckCircle, 'Pending': Clock, 'Returned': XCircle,
};

const statusColors: Record<string, string> = {
  'Received': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Ready': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Unrepairable': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Returned': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function TrackOrder({ isModal = false }: { isModal?: boolean }) {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [merchantSettings, setMerchantSettings] = useState<any>(null);
  const [utr, setUtr] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setTrackingId(id); handleTrackDirect(id); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrackDirect = async (id: string) => {
    setLoading(true); setSearched(true);
    const { data, error } = await supabase.rpc('track_order', { _tracking_id: id });
    if (error) { console.error(error); setResult(null); } 
    else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = data as any;
      setResult(responseData);
      if (responseData && responseData.user_id) {
        const { data: mSettings } = await supabase.from('shop_settings').select('*').eq('user_id', responseData.user_id).maybeSingle();
        setMerchantSettings(mSettings);
      }
    }
    setLoading(false);
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) return;
    handleTrackDirect(trackingId.trim());
  };

  const downloadInvoicePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(result.type === 'job' ? 'REPAIR INVOICE' : 'SALES INVOICE', 14, 20);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${result.tracking_id}`, 14, 28);
    doc.text(`Date: ${new Date(result.created_at).toLocaleDateString()}`, 14, 34);
    doc.line(14, 38, 196, 38);

    if (result.type === 'job') {
      doc.text(`Customer: ${result.customer_name}`, 14, 46);
      doc.text(`Device: ${result.device_brand} ${result.device_model || ''}`, 14, 52);
      doc.text(`Problem: ${result.problem}`, 14, 58);
      doc.text(`Status: ${result.status}`, 14, 64);
      autoTable(doc, {
        startY: 72, head: [['Service', 'Status', 'Amount']],
        body: [[result.problem, result.status, `Rs.${Number(result.estimated_cost).toLocaleString()}`]],
        theme: 'striped', headStyles: { fillColor: [67, 56, 202] },
      });
    } else {
      doc.text(`Item: ${result.item_name}`, 14, 46);
      doc.text(`Quantity: ${result.quantity}`, 14, 52);
      autoTable(doc, {
        startY: 60, head: [['Item', 'Qty', 'Total']],
        body: [[result.item_name, String(result.quantity), `Rs.${Number(result.total).toLocaleString()}`]],
        theme: 'striped', headStyles: { fillColor: [67, 56, 202] },
      });
    }

    doc.setFontSize(8); doc.text('Thank you!', 14, 280);
    doc.save(`Invoice-${result.tracking_id}.pdf`);
  };

  const StatusIcon = result ? (statusIcons[result.status] || Clock) : Clock;

  return (
    <div className={`${isModal ? 'p-6' : 'min-h-screen flex flex-col items-center justify-center p-4'} bg-background relative`}>
      {!isModal && (
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      )}
      <div className={`w-full max-w-md space-y-6 ${!isModal ? 'mt-12 md:mt-0' : ''}`}>
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Smartphone className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">Enter your Job or Sell tracking ID</p>
        </div>

        <div className="flex gap-2">
          <Input placeholder="e.g. TRK-JOB-0001 or your Job/Sell ID" value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()} className="font-mono" />
          <Button onClick={handleTrack} disabled={loading}><Search className="h-4 w-4" /></Button>
        </div>

        {loading && <div className="text-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>}

        {!loading && searched && !result && (
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-destructive/50 mx-auto mb-3" />
              <h3 className="font-semibold">Not Found</h3>
              <p className="text-sm text-muted-foreground mt-1">No order found. It may have expired or ID is incorrect.</p>
              <p className="text-xs text-muted-foreground mt-2">Jobs trackable 3 days after delivery. Sales trackable for 30 days.</p>
            </CardContent>
          </Card>
        )}

        {!loading && result && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-mono">{result.tracking_id}</CardTitle>
                <Badge className={`${statusColors[result.status] || ''} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />{result.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.type === 'job' ? (
                <>
                  <InfoRow label="Customer" value={result.customer_name} />
                  <InfoRow label="Device" value={`${result.device_brand} ${result.device_model || ''}`} />
                  <InfoRow label="Problem" value={result.problem} />
                  <InfoRow label="Estimated Cost" value={`Rs.${Number(result.estimated_cost).toLocaleString()}`} />
                  <InfoRow label="Created" value={new Date(result.created_at).toLocaleDateString('en-IN')} />
                  {result.delivered_at && <InfoRow label="Delivered" value={new Date(result.delivered_at).toLocaleDateString('en-IN')} />}
                </>
              ) : (
                <>
                  <InfoRow label="Item" value={result.item_name} />
                  <InfoRow label="Quantity" value={String(result.quantity)} />
                  <InfoRow label="Total" value={`Rs.${Number(result.total).toLocaleString()}`} />
                  <InfoRow label="Date" value={new Date(result.created_at).toLocaleDateString('en-IN')} />
                </>
              )}
              <Button className="w-full mt-3" variant="outline" size="sm" onClick={downloadInvoicePDF}>
                <FileText className="h-4 w-4 mr-2" /> Download Invoice PDF
              </Button>

              {result.status !== 'Delivered' && result.status !== 'Returned' && merchantSettings?.upi_id && (
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full gradient-primary shadow-lg shadow-primary/20" onClick={() => setPayOpen(!payOpen)}>
                    <IndianRupee className="h-4 w-4 mr-2" /> {payOpen ? 'Close Payment' : 'Pay Online Now'}
                    {payOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
                  </Button>

                  {payOpen && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="bg-muted rounded-2xl p-6 text-center space-y-4">
                        <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
                          <QRCodeSVG 
                            value={`upi://pay?pa=${merchantSettings.upi_id}&pn=${encodeURIComponent(merchantSettings.shop_name || 'Merchant')}&am=${result.type === 'job' ? result.estimated_cost : result.total}&cu=INR`} 
                            size={160}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payable Amount</p>
                          <p className="text-2xl font-black text-primary">₹{result.type === 'job' ? result.estimated_cost : result.total}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 bg-background/50 py-2 rounded-lg border border-dashed">
                          <span className="font-mono text-xs font-bold">{merchantSettings.upi_id}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(merchantSettings.upi_id); toast.success('UPI ID copied'); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Submit Transaction ID (UTR)</Label>
                        <div className="flex gap-2">
                          <Input value={utr} onChange={e => setUtr(e.target.value)} placeholder="12-digit UTR number" className="h-10" />
                          <Button onClick={async () => {
                            if (!utr.trim()) { toast.error('Enter UTR number'); return; }
                            setSubmittingPay(true);
                            // Store payment proof in wallet_transactions or a new table
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const { error } = await (supabase as any).from('customer_payments').insert({
                               user_id: result.user_id,
                               tracking_id: result.tracking_id,
                               amount: result.type === 'job' ? result.estimated_cost : result.total,
                               utr_number: utr,
                               customer_name: result.customer_name || 'Guest',
                               status: 'pending'
                            });
                            if (error) toast.error('Failed to submit. Try again.');
                            else { toast.success('Payment details submitted to shop!'); setPayOpen(false); setUtr(''); }
                            setSubmittingPay(false);
                          }} disabled={submittingPay}>Submit</Button>
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground">The shop owner will verify and update your status.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <a href="/auth" className="text-sm text-primary hover:underline">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
