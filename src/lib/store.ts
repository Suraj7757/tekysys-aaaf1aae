import { Customer, RepairJob, Payment, SettlementCycle, InventoryItem } from './types';

const STORAGE_KEYS = {
  customers: 'repairshop_customers',
  jobs: 'repairshop_jobs',
  payments: 'repairshop_payments',
  settlements: 'repairshop_settlements',
  inventory: 'repairshop_inventory',
  jobCounter: 'repairshop_job_counter',
};

function get<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed some demo data
function seedIfEmpty() {
  if (localStorage.getItem(STORAGE_KEYS.customers)) return;

  const customers: Customer[] = [
    { id: '1', name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@mail.com', createdAt: '2026-03-01' },
    { id: '2', name: 'Priya Patel', mobile: '9876543211', email: 'priya@mail.com', createdAt: '2026-03-02' },
    { id: '3', name: 'Amit Kumar', mobile: '9876543212', createdAt: '2026-03-03' },
  ];

  const jobs: RepairJob[] = [
    { id: '1', jobId: 'REP-0001', customerId: '1', customerName: 'Rahul Sharma', customerMobile: '9876543210', deviceBrand: 'Samsung', deviceModel: 'Galaxy S23', problemDescription: 'Screen cracked', technicianName: 'Vijay', status: 'Delivered', estimatedCost: 3500, createdAt: '2026-03-01', updatedAt: '2026-03-03', deliveredAt: '2026-03-03' },
    { id: '2', jobId: 'REP-0002', customerId: '2', customerName: 'Priya Patel', customerMobile: '9876543211', deviceBrand: 'iPhone', deviceModel: '15 Pro', problemDescription: 'Battery replacement', technicianName: 'Vijay', status: 'In Progress', estimatedCost: 4500, createdAt: '2026-03-05', updatedAt: '2026-03-05' },
    { id: '3', jobId: 'REP-0003', customerId: '3', customerName: 'Amit Kumar', customerMobile: '9876543212', deviceBrand: 'OnePlus', deviceModel: '12', problemDescription: 'Charging port issue', technicianName: 'Ravi', status: 'Ready', estimatedCost: 1500, createdAt: '2026-03-08', updatedAt: '2026-03-10' },
    { id: '4', jobId: 'REP-0004', customerId: '1', customerName: 'Rahul Sharma', customerMobile: '9876543210', deviceBrand: 'Xiaomi', deviceModel: 'Redmi Note 13', problemDescription: 'Software issue', technicianName: 'Ravi', status: 'Received', estimatedCost: 800, createdAt: '2026-03-12', updatedAt: '2026-03-12' },
  ];

  const payments: Payment[] = [
    { id: '1', jobId: 'REP-0001', repairJobId: '1', amount: 3500, method: 'UPI/QR', qrReceiver: 'Admin QR', adminShare: 1750, staffShare: 1750, settled: false, createdAt: '2026-03-03' },
  ];

  const inventory: InventoryItem[] = [
    { id: '1', name: 'Samsung Screen S23', sku: 'SCR-SAM-S23', category: 'Screens', quantity: 5, minStock: 3, costPrice: 1800, sellPrice: 3000, gstPercent: 18, updatedAt: '2026-03-01' },
    { id: '2', name: 'iPhone 15 Battery', sku: 'BAT-IP-15', category: 'Batteries', quantity: 2, minStock: 5, costPrice: 1200, sellPrice: 2500, gstPercent: 18, updatedAt: '2026-03-01' },
    { id: '3', name: 'USB-C Charging Port', sku: 'PRT-USBC', category: 'Parts', quantity: 15, minStock: 10, costPrice: 150, sellPrice: 400, gstPercent: 18, updatedAt: '2026-03-01' },
    { id: '4', name: 'Tempered Glass Universal', sku: 'ACC-TG-UNI', category: 'Accessories', quantity: 50, minStock: 20, costPrice: 30, sellPrice: 150, gstPercent: 18, updatedAt: '2026-03-01' },
  ];

  set(STORAGE_KEYS.customers, customers);
  set(STORAGE_KEYS.jobs, jobs);
  set(STORAGE_KEYS.payments, payments);
  set(STORAGE_KEYS.settlements, []);
  set(STORAGE_KEYS.inventory, inventory);
  localStorage.setItem(STORAGE_KEYS.jobCounter, '4');
}

seedIfEmpty();

export const store = {
  getCustomers: () => get<Customer>(STORAGE_KEYS.customers, []),
  saveCustomers: (c: Customer[]) => set(STORAGE_KEYS.customers, c),
  addCustomer: (c: Customer) => { const all = store.getCustomers(); all.push(c); store.saveCustomers(all); },
  findCustomerByMobile: (mobile: string) => store.getCustomers().find(c => c.mobile === mobile),

  getJobs: () => get<RepairJob>(STORAGE_KEYS.jobs, []),
  saveJobs: (j: RepairJob[]) => set(STORAGE_KEYS.jobs, j),
  addJob: (j: RepairJob) => { const all = store.getJobs(); all.push(j); store.saveJobs(all); },
  updateJob: (id: string, updates: Partial<RepairJob>) => {
    const all = store.getJobs().map(j => j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : j);
    store.saveJobs(all);
    return all.find(j => j.id === id);
  },
  nextJobId: () => {
    const counter = parseInt(localStorage.getItem(STORAGE_KEYS.jobCounter) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.jobCounter, counter.toString());
    return `REP-${counter.toString().padStart(4, '0')}`;
  },

  getPayments: () => get<Payment>(STORAGE_KEYS.payments, []),
  savePayments: (p: Payment[]) => set(STORAGE_KEYS.payments, p),
  addPayment: (p: Payment) => { const all = store.getPayments(); all.push(p); store.savePayments(all); },

  getSettlements: () => get<SettlementCycle>(STORAGE_KEYS.settlements, []),
  saveSettlements: (s: SettlementCycle[]) => set(STORAGE_KEYS.settlements, s),
  addSettlement: (s: SettlementCycle) => { const all = store.getSettlements(); all.push(s); store.saveSettlements(all); },

  getInventory: () => get<InventoryItem>(STORAGE_KEYS.inventory, []),
  saveInventory: (i: InventoryItem[]) => set(STORAGE_KEYS.inventory, i),
  addInventoryItem: (i: InventoryItem) => { const all = store.getInventory(); all.push(i); store.saveInventory(all); },
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => {
    const all = store.getInventory().map(i => i.id === id ? { ...i, ...updates } : i);
    store.saveInventory(all);
  },
};
