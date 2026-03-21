import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RepairJob, Payment, ShopSettings } from './types';

export function generateInvoicePDF(job: RepairJob, payment: Payment | undefined, settings: ShopSettings) {
  const doc = new jsPDF();
  // ... same content generation as before ...
  // Remove doc.save(...) and return doc
  return doc;
}

export function downloadInvoice(job: RepairJob, payment: Payment | undefined, settings: ShopSettings) {
  const doc = generateInvoicePDF(job, payment, settings);
  doc.save(`Invoice-${job.jobId}.pdf`);
}
