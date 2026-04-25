import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone, Laptop, Tv2, Wind, Refrigerator, Monitor,
  Camera, Gamepad2, Printer as PrinterIcon, CheckCircle2,
  Shield, Zap, Droplets, Volume2, Battery, Cpu, Wrench,
  HelpCircle, AlertTriangle, IndianRupee, Tag, Clock
} from 'lucide-react';

const categories = [
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'from-violet-500 to-purple-600', light: 'bg-violet-50 border-violet-300 text-violet-700' },
  { id: 'laptop', name: 'Laptop', icon: Laptop, color: 'from-blue-500 to-cyan-600', light: 'bg-blue-50 border-blue-300 text-blue-700' },
  { id: 'tv', name: 'TV/LED', icon: Tv2, color: 'from-indigo-500 to-blue-600', light: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
  { id: 'ac', name: 'AC', icon: Wind, color: 'from-cyan-500 to-teal-600', light: 'bg-cyan-50 border-cyan-300 text-cyan-700' },
  { id: 'fridge', name: 'Fridge', icon: Refrigerator, color: 'from-sky-500 to-blue-600', light: 'bg-sky-50 border-sky-300 text-sky-700' },
  { id: 'pc', name: 'PC/Desktop', icon: Monitor, color: 'from-slate-500 to-gray-600', light: 'bg-slate-50 border-slate-300 text-slate-700' },
  { id: 'camera', name: 'Camera', icon: Camera, color: 'from-amber-500 to-orange-600', light: 'bg-amber-50 border-amber-300 text-amber-700' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'from-pink-500 to-rose-600', light: 'bg-pink-50 border-pink-300 text-pink-700' },
  { id: 'printer', name: 'Printer', icon: PrinterIcon, color: 'from-green-500 to-emerald-600', light: 'bg-green-50 border-green-300 text-green-700' },
];

const problemTags = [
  { id: 'screen', label: 'Screen Broken', icon: Smartphone },
  { id: 'battery', label: 'Battery Dead', icon: Battery },
  { id: 'charging', label: 'Charging Issue', icon: Zap },
  { id: 'speaker', label: 'Speaker Fault', icon: Volume2 },
  { id: 'water', label: 'Water Damage', icon: Droplets },
  { id: 'motherboard', label: 'Motherboard', icon: Cpu },
  { id: 'software', label: 'Software Issue', icon: Shield },
  { id: 'overheating', label: 'Overheating', icon: AlertTriangle },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

const mobileBrands = ['Samsung', 'Apple', 'Xiaomi', 'Realme', 'OnePlus', 'Vivo', 'OPPO', 'Motorola', 'Nokia', 'Other'];
const laptopBrands = ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Toshiba', 'Sony', 'Other'];
const tvBrands = ['Samsung', 'LG', 'Sony', 'Mi', 'OnePlus', 'Panasonic', 'Vu', 'TCL', 'Other'];
const genericBrands = ['Samsung', 'LG', 'Sony', 'Haier', 'Voltas', 'Blue Star', 'Whirlpool', 'Other'];

const getBrands = (cat: string) => {
  if (cat === 'mobile') return mobileBrands;
  if (cat === 'laptop' || cat === 'pc') return laptopBrands;
  if (cat === 'tv') return tvBrands;
  return genericBrands;
};

interface RepairCaseFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function RepairCaseForm({ data, onChange }: RepairCaseFormProps) {
  const [activeTab, setActiveTab] = useState(data.service_category || 'mobile');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (data.service_category && data.service_category !== activeTab) {
      setActiveTab(data.service_category);
    }
  }, [data.service_category]);

  const updateData = (fields: any) => onChange({ ...data, ...fields });
  const updateDetails = (fields: any) => onChange({ ...data, device_details: { ...(data.device_details || {}), ...fields } });

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    updateData({ service_category: val, device_brand: '', device_model: '' });
  };

  const toggleTag = (id: string, label: string) => {
    const newTags = selectedTags.includes(id)
      ? selectedTags.filter(t => t !== id)
      : [...selectedTags, id];
    setSelectedTags(newTags);
    const tagLabels = problemTags.filter(t => newTags.includes(t.id)).map(t => t.label);
    updateData({ problem_description: tagLabels.join(', ') + (data.problem_description?.replace(/^[^—]*/, '') || '') });
  };

  const activeCat = categories.find(c => c.id === activeTab);

  return (
    <div className="space-y-5">
      {/* Category Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> Select Device Category
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTabChange(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-transparent shadow-lg scale-105'
                    : 'border-border hover:border-muted-foreground/30 hover:scale-102 bg-muted/30'
                }`}
                style={isActive ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  isActive ? `bg-gradient-to-br ${cat.color} shadow-md` : 'bg-muted'
                }`}>
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} style={{ height: '1.1rem', width: '1.1rem' }} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {cat.name}
                </span>
                {isActive && <CheckCircle2 className="h-3 w-3 text-primary absolute" style={{ marginTop: '-2px' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Info Fields */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Brand / Make</Label>
              <Select value={data.device_brand || ''} onValueChange={v => updateData({ device_brand: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {getBrands(activeTab).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Model Name / Number</Label>
              <Input
                placeholder="e.g. S23 Ultra, Pavilion X360"
                className="h-9"
                value={data.device_model || ''}
                onChange={e => updateData({ device_model: e.target.value })}
              />
            </div>
          </div>

          {/* Category-Specific Fields */}
          {activeTab === 'mobile' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">IMEI / Serial Number</Label>
                <Input placeholder="15-digit IMEI" className="h-9 font-mono" value={data.device_details?.imei || ''} onChange={e => updateDetails({ imei: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Screen Lock</Label>
                <Input placeholder="PIN / Pattern / Password" className="h-9" value={data.device_details?.security || ''} onChange={e => updateDetails({ security: e.target.value })} />
              </div>
            </div>
          )}
          {activeTab === 'laptop' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Serial Number</Label>
                <Input placeholder="S/N: 12345..." className="h-9 font-mono" value={data.device_details?.serial || ''} onChange={e => updateDetails({ serial: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">RAM / Processor</Label>
                <Input placeholder="e.g. 16GB, i7 12th Gen" className="h-9" value={data.device_details?.config || ''} onChange={e => updateDetails({ config: e.target.value })} />
              </div>
            </div>
          )}
          {activeTab === 'tv' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Screen Size</Label>
                <Select value={data.device_details?.size || ''} onValueChange={v => updateDetails({ size: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {['32', '43', '50', '55', '65', '75+'].map(s => <SelectItem key={s} value={s}>{s} Inch</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Panel Type</Label>
                <Select value={data.device_details?.panel || ''} onValueChange={v => updateDetails({ panel: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['LED', 'OLED', 'QLED', 'Plasma', 'Smart TV'].map(p => <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {activeTab === 'ac' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">AC Type</Label>
                <Select value={data.device_details?.ac_type || ''} onValueChange={v => updateDetails({ ac_type: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split AC</SelectItem>
                    <SelectItem value="window">Window AC</SelectItem>
                    <SelectItem value="tower">Tower AC</SelectItem>
                    <SelectItem value="cassette">Cassette AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Capacity (Ton)</Label>
                <Input placeholder="e.g. 1.5 Ton" className="h-9" value={data.device_details?.capacity || ''} onChange={e => updateDetails({ capacity: e.target.value })} />
              </div>
            </div>
          )}
          {activeTab === 'fridge' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Fridge Type</Label>
                <Select value={data.device_details?.fridge_type || ''} onValueChange={v => updateDetails({ fridge_type: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Door</SelectItem>
                    <SelectItem value="double">Double Door</SelectItem>
                    <SelectItem value="side">Side by Side</SelectItem>
                    <SelectItem value="french">French Door</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Technology</Label>
                <Select value={data.device_details?.tech || ''} onValueChange={v => updateDetails({ tech: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Inverter?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inverter">Inverter</SelectItem>
                    <SelectItem value="non-inverter">Non-Inverter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {activeTab === 'pc' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">CPU / Cabinet Type</Label>
                <Input placeholder="e.g. Tower, Gaming, Mini" className="h-9" value={data.device_details?.cabinet || ''} onChange={e => updateDetails({ cabinet: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Processor</Label>
                <Input placeholder="e.g. i7 12th Gen, Ryzen 5" className="h-9" value={data.device_details?.motherboard || ''} onChange={e => updateDetails({ motherboard: e.target.value })} />
              </div>
            </div>
          )}

          {/* Problem Tags */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" /> Problem Tags (Quick Select)
            </Label>
            <div className="flex flex-wrap gap-2">
              {problemTags.map(tag => {
                const Icon = tag.icon;
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id, tag.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                        : 'bg-muted/50 border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Problem Description *</Label>
            <Textarea
              placeholder="Describe the issue in detail... (e.g. screen not displaying, touch not working)"
              className="min-h-[85px] resize-none text-sm"
              value={data.problem_description || ''}
              onChange={e => updateData({ problem_description: e.target.value })}
            />
          </div>

          {/* Accessories + Cost + Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Accessories Included</Label>
              <Input
                placeholder="Charger, Battery, Remote..."
                className="h-9"
                value={data.device_details?.accessories || ''}
                onChange={e => updateDetails({ accessories: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" /> Estimated Cost (₹)
              </Label>
              <Input
                type="number"
                className="h-9 font-bold text-primary border-primary/30 focus-visible:ring-primary"
                placeholder="0"
                value={data.estimated_cost || ''}
                onChange={e => updateData({ estimated_cost: e.target.value })}
              />
            </div>
          </div>

          {/* Urgency + Warranty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Urgency</Label>
              <Select value={data.device_details?.urgency || 'normal'} onValueChange={v => updateDetails({ urgency: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">⏱ Normal</SelectItem>
                  <SelectItem value="express">⚡ Express</SelectItem>
                  <SelectItem value="emergency">🚨 Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Warranty Status</Label>
              <Select value={data.device_details?.warranty || 'out'} onValueChange={v => updateDetails({ warranty: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">✅ In Warranty</SelectItem>
                  <SelectItem value="out">❌ Out of Warranty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
