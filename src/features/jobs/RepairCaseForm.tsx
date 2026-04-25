import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Laptop, Tv2, Wind, Refrigerator, Monitor,
  Info, Shield, Cpu, Zap
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { id: 'mobile', name: 'Mobile', icon: Smartphone },
  { id: 'laptop', name: 'Laptop', icon: Laptop },
  { id: 'tv', name: 'TV/LED', icon: Tv2 },
  { id: 'ac', name: 'AC', icon: Wind },
  { id: 'fridge', name: 'Fridge', icon: Refrigerator },
  { id: 'pc', name: 'PC/Desktop', icon: Monitor },
];

interface RepairCaseFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function RepairCaseForm({ data, onChange }: RepairCaseFormProps) {
  const [activeTab, setActiveTab] = useState(data.service_category || 'mobile');

  // Sync internal activeTab state with external service_category prop
  useEffect(() => {
    if (data.service_category && data.service_category !== activeTab) {
      setActiveTab(data.service_category);
    }
  }, [data.service_category]);

  const updateData = (fields: any) => {
    onChange({ ...data, ...fields });
  };

  const updateDetails = (fields: any) => {
    onChange({ 
      ...data, 
      device_details: { ...(data.device_details || {}), ...fields } 
    });
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    updateData({ service_category: val });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Select Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleTabChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                activeTab === cat.id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-muted/50 border-transparent hover:border-primary/30 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              <span className="text-sm font-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 bg-muted/20 p-4 rounded-2xl border border-primary/5"
        >
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Brand / Make</Label>
              <Input 
                placeholder="e.g. Samsung, HP, Sony" 
                value={data.device_brand || ''} 
                onChange={(e) => updateData({ device_brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">Model Name / Number</Label>
              <Input 
                placeholder="e.g. S23 Ultra, Pavilion X360" 
                value={data.device_model || ''} 
                onChange={(e) => updateData({ device_model: e.target.value })}
              />
            </div>
          </div>

          {/* Category Specific Fields */}
          {activeTab === 'mobile' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">IMEI / Serial Number</Label>
                <Input 
                  placeholder="15-digit IMEI" 
                  value={data.device_details?.imei || ''} 
                  onChange={(e) => updateDetails({ imei: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Security Lock</Label>
                <Input 
                  placeholder="Pattern/PIN/Password" 
                  value={data.device_details?.security || ''} 
                  onChange={(e) => updateDetails({ security: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'laptop' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">Serial Number</Label>
                <Input 
                  placeholder="S/N: 12345..." 
                  value={data.device_details?.serial || ''} 
                  onChange={(e) => updateDetails({ serial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">RAM / Processor</Label>
                <Input 
                  placeholder="e.g. 16GB, i7 12th Gen" 
                  value={data.device_details?.config || ''} 
                  onChange={(e) => updateDetails({ config: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'tv' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">Screen Size</Label>
                <Select 
                  value={data.device_details?.size || ''} 
                  onValueChange={(v) => updateDetails({ size: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="32">32 Inch</SelectItem>
                    <SelectItem value="43">43 Inch</SelectItem>
                    <SelectItem value="55">55 Inch</SelectItem>
                    <SelectItem value="65+">65+ Inch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Panel Type</Label>
                <Select 
                  value={data.device_details?.panel || ''} 
                  onValueChange={(v) => updateDetails({ panel: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="led">LED</SelectItem>
                    <SelectItem value="oled">OLED</SelectItem>
                    <SelectItem value="qled">QLED</SelectItem>
                    <SelectItem value="plasma">Plasma/Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'ac' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">AC Type</Label>
                <Select 
                  value={data.device_details?.ac_type || ''} 
                  onValueChange={(v) => updateDetails({ ac_type: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split AC</SelectItem>
                    <SelectItem value="window">Window AC</SelectItem>
                    <SelectItem value="tower">Tower AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Capacity (Ton)</Label>
                <Input 
                  placeholder="e.g. 1.5 Ton" 
                  value={data.device_details?.capacity || ''} 
                  onChange={(e) => updateDetails({ capacity: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'fridge' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">Fridge Type</Label>
                <Select 
                  value={data.device_details?.fridge_type || ''} 
                  onValueChange={(v) => updateDetails({ fridge_type: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Door</SelectItem>
                    <SelectItem value="double">Double Door</SelectItem>
                    <SelectItem value="side">Side by Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Technology</Label>
                <Select 
                  value={data.device_details?.tech || ''} 
                  onValueChange={(v) => updateDetails({ tech: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Inverter?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inverter">Inverter</SelectItem>
                    <SelectItem value="non-inverter">Non-Inverter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'pc' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">CPU / Cabinet Type</Label>
                <Input 
                  placeholder="e.g. Tower, Gaming, Mini" 
                  value={data.device_details?.cabinet || ''} 
                  onChange={(e) => updateDetails({ cabinet: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">Motherboard</Label>
                <Input 
                  placeholder="e.g. ASUS Prime H610" 
                  value={data.device_details?.motherboard || ''} 
                  onChange={(e) => updateDetails({ motherboard: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold">Problem Description *</Label>
            <Textarea 
              placeholder="Describe the issue in detail..." 
              className="min-h-[100px] resize-none"
              value={data.problem_description || ''}
              onChange={(e) => updateData({ problem_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label className="text-xs font-bold">Accessories Included</Label>
              <Input 
                placeholder="Charger, Battery, Remote..." 
                value={data.device_details?.accessories || ''} 
                onChange={(e) => updateDetails({ accessories: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-primary">Estimated Cost (₹)</Label>
              <Input 
                type="number" 
                className="font-bold text-primary border-primary/20 focus-visible:ring-primary"
                placeholder="0" 
                value={data.estimated_cost || ''} 
                onChange={(e) => updateData({ estimated_cost: e.target.value })}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
