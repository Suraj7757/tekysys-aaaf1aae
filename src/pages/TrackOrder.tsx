import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Smartphone, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id')?.toUpperCase() || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setTrackingId(id.toUpperCase()); handleTrackDirect(id.toUpperCase()); }
  }, []);

  const handleTrackDirect = async (id: string) => {
    setLoading(true); setSearched(true);
    const { data, error } = await supabase.rpc('track_order', { _tracking_id: id });
    if (error) { console.error(error); setResult(null); } else setResult(data);
    setLoading(false);
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) return;
    handleTrackDirect(trackingId.trim().toUpperCase());
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Smartphone className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">Enter your Job or Sell tracking ID</p>
        </div>

        <div className="flex gap-2">
          <Input placeholder="e.g. JOB000001 or SELL000001" value={trackingId}
            onChange={e => setTrackingId(e.target.value.toUpperCase())}
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
