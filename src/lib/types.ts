export type JobStatus =
  | "Received"
  | "In Progress"
  | "Ready"
  | "Delivered"
  | "Rejected"
  | "Unrepairable";
export type PaymentMethod = "Cash" | "UPI/QR" | "Due";
export type UserRole = "admin" | "staff";

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface RepairJob {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  deviceBrand: string;
  deviceModel: string;
  problemDescription: string;
  technicianId?: string;
  technicianName?: string;
  status: JobStatus;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface Payment {
  id: string;
  jobId: string;
  repairJobId: string;
  amount: number;
  method: PaymentMethod;
  qrReceiver?: string;
  adminShare: number;
  staffShare: number;
  settled: boolean;
  settlementCycleId?: string;
  createdAt: string;
}

export interface SettlementCycle {
  id: string;
  startDate: string;
  endDate: string;
  totalJobs: number;
  totalRevenue: number;
  adminShare: number;
  staffShare: number;
  settledAt: string;
  settledBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  gstPercent: number;
  updatedAt: string;
}

export interface ShopSettings {
  shopName: string;
  phone: string;
  address: string;
  gstin: string;
  adminSharePercent: number;
  staffSharePercent: number;
  qrReceivers: string[];
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  unsettledEarnings: number;
  cashTotal: number;
  upiTotal: number;
  dueTotal: number;
  adminShare: number;
  staffShare: number;
}
