import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RepairJob, Payment, ShopSettings } from './types';

export function generateInvoicePDF(job: RepairJob, payment: Payment | undefined, settings: ShopSettings) {
  const doc = new jsPDF();
  const amount = payment?.amount ?? job.estimatedCost;
  const gst = 18;
  const baseAmount = Math.round(amount / (1 + gst / 100));
  const gstAmount = amount - baseAmount;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName, 14, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.address, 14, 27);
  doc.text(`Phone: ${settings.phone} | GSTIN: ${settings.gstin}`, 14, 33);

  // Invoice title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 150, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: INV-${job.jobId}`, 150, 27);
  doc.text(`Date: ${job.deliveredAt || job.updatedAt}`, 150, 33);

  doc.setDrawColor(200);
  doc.line(14, 37, 196, 37);

  // Customer info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(job.customerName, 14, 50);
  doc.text(`Mobile: ${job.customerMobile}`, 14, 56);

  // Job info
  doc.setFont('helvetica', 'bold');
  doc.text('Job Details:', 110, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`Job ID: ${job.jobId}`, 110, 50);
  doc.text(`Device: ${job.deviceBrand} ${job.deviceModel}`, 110, 56);
  doc.text(`Problem: ${job.problemDescription}`, 110, 62);

  // Table
  autoTable(doc, {
    startY: 72,
    head: [['#', 'Description', 'Amount (₹)']],
    body: [
      ['1', `Repair Service - ${job.deviceBrand} ${job.deviceModel}\n${job.problemDescription}`, baseAmount.toLocaleString()],
    ],
    foot: [
      ['', 'Subtotal', `₹${baseAmount.toLocaleString()}`],
      ['', `GST (${gst}%)`, `₹${gstAmount.toLocaleString()}`],
      ['', 'Total', `₹${amount.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60] },
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  // Payment info
  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  doc.setFontSize(9);
  if (payment) {
    doc.text(`Payment Method: ${payment.method}${payment.qrReceiver ? ` (${payment.qrReceiver})` : ''}`, 14, finalY + 10);
  }
  doc.text('Thank you for your business!', 14, finalY + 20);

  // Save and open print
  doc.save(`Invoice-${job.jobId}.pdf`);
}
