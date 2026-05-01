import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RepairJob, Payment, ShopSettings } from "./types";

export interface SellInvoiceData {
  sellId: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  sellPrice: number;
  total: number;
  customerName: string;
  customerMobile: string;
  paymentMethod: string;
  createdAt: string;
}

export function generateInvoicePDF(
  job: RepairJob,
  payment: Payment | undefined,
  settings: ShopSettings,
) {
  // 80mm width is common for thermal printers (approx 226 points)
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 150 + job.problemDescription.length / 2], // Dynamic height based on content
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(settings.shopName || "RepairXpert", 40, 10, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  let currentY = 15;
  if (settings.address) {
    const splitAddr = doc.splitTextToSize(settings.address, 70);
    doc.text(splitAddr, 40, currentY, { align: "center" });
    currentY += splitAddr.length * 3;
  }
  if (settings.phone) {
    doc.text(`Phone: ${settings.phone}`, 40, currentY, { align: "center" });
    currentY += 4;
  }
  if (settings.gstin) {
    doc.text(`GSTIN: ${settings.gstin}`, 40, currentY, { align: "center" });
    currentY += 4;
  }

  doc.setLineWidth(0.1);
  doc.line(5, currentY, 75, currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("REPAIR BILL", 40, currentY, { align: "center" });
  currentY += 5;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Job ID: ${job.jobId}`, 5, currentY);
  doc.text(
    `Date: ${new Date(job.createdAt).toLocaleDateString()}`,
    75,
    currentY,
    { align: "right" },
  );
  currentY += 5;

  doc.line(5, currentY, 75, currentY);
  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Customer:", 5, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${job.customerName}`, 20, currentY);
  currentY += 4;
  doc.text(`Mobile: ${job.customerMobile}`, 20, currentY);
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Device:", 5, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${job.deviceBrand} ${job.deviceModel || ""}`, 20, currentY);
  currentY += 4;

  const tableData: any[][] = [];
  tableData.push([
    "Service",
    job.problemDescription,
    `Rs.${job.estimatedCost}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 5, right: 5 },
    head: [["Item", "Desc", "Amt"]],
    body: tableData,
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: { fontStyle: "bold", lineColor: [0, 0, 0], lineWidth: 0.1 },
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY + 10;
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Amount: Rs.${payment ? payment.amount : job.estimatedCost}`,
    75,
    currentY,
    { align: "right" },
  );
  currentY += 6;

  if (payment) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Paid via: ${payment.method}`, 5, currentY);
    currentY += 4;
  }

  doc.line(5, currentY, 75, currentY);
  currentY += 5;

  doc.setFontSize(6);
  doc.text("Thank you for choosing us!", 40, currentY, { align: "center" });
  currentY += 3;
  doc.text(
    `Visit again to ${settings.shopName || "RepairXpert"}`,
    40,
    currentY,
    { align: "center" },
  );

  return doc;
}

export function downloadInvoice(
  job: RepairJob,
  payment: Payment | undefined,
  settings: ShopSettings,
) {
  const doc = generateInvoicePDF(job, payment, settings);
  doc.save(`Bill-${job.jobId}.pdf`);
}

export function generateSellInvoicePDF(
  sell: SellInvoiceData,
  settings: ShopSettings,
) {
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 130],
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(settings.shopName || "RepairXpert", 40, 10, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  let currentY = 15;
  if (settings.address) {
    const splitAddr = doc.splitTextToSize(settings.address, 70);
    doc.text(splitAddr, 40, currentY, { align: "center" });
    currentY += splitAddr.length * 3;
  }
  if (settings.phone) {
    doc.text(`Phone: ${settings.phone}`, 40, currentY, { align: "center" });
    currentY += 4;
  }

  doc.setLineWidth(0.1);
  doc.line(5, currentY, 75, currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SALES BILL", 40, currentY, { align: "center" });
  currentY += 5;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Sale ID: ${sell.sellId}`, 5, currentY);
  doc.text(
    `Date: ${new Date(sell.createdAt).toLocaleDateString()}`,
    75,
    currentY,
    { align: "right" },
  );
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 5, right: 5 },
    head: [["Item", "Qty", "Price", "Total"]],
    body: [
      [
        sell.itemName,
        String(sell.quantity),
        `Rs.${sell.sellPrice}`,
        `Rs.${sell.total}`,
      ],
    ],
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: { fontStyle: "bold", lineColor: [0, 0, 0], lineWidth: 0.1 },
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY + 10;
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs.${sell.total}`, 75, currentY, { align: "right" });
  currentY += 6;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment: ${sell.paymentMethod}`, 5, currentY);
  currentY += 6;

  doc.line(5, currentY, 75, currentY);
  currentY += 5;

  doc.setFontSize(6);
  doc.text("Thank you for your purchase!", 40, currentY, { align: "center" });

  return doc;
}

export function downloadSellInvoice(
  sell: SellInvoiceData,
  settings: ShopSettings,
) {
  const doc = generateSellInvoicePDF(sell, settings);
  doc.save(`Sale-${sell.sellId}.pdf`);
}
