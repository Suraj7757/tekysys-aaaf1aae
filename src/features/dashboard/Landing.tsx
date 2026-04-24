import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Smartphone, Wrench, Package, ShoppingCart, BarChart3, Shield, Users, Wallet,
  Gift, Monitor, Bell, MessageCircle, ArrowRight, CheckCircle, Star, Zap, Mail, ConciergeBell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewsTicker } from '@/components/layout/NewsTicker';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import TrackOrder from '@/features/jobs/TrackOrder';

const ADMIN_WHATSAPP = '7319884599';
const SUPER_ADMIN = 'krs715665@gmail.com';

const features = [
  { icon: ConciergeBell, title: 'Multi Services Management', desc: 'Full service catalog with pricing ranges, turnaround times, categories, and status management. Mark popular services and track job counts per service.' },
  { icon: Wrench, title: 'Repair Job Management', desc: 'Track repair jobs with unique IDs, status updates, and customer notifications.' },
  { icon: Package, title: 'Inventory Management', desc: 'Full stock tracking with low-stock alerts and GST-compliant invoicing.' },
  { icon: ShoppingCart, title: 'Sales & Invoicing', desc: 'Sell inventory items with PDF invoices and WhatsApp sharing.' },
  { icon: Wallet, title: 'Wallet & Earnings', desc: 'Built-in wallet system with ad revenue, referral bonuses, and withdrawals.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue charts, payment breakdowns, and business insights.' },
];

const getPlans = (cycle: 'monthly' | 'quarterly' | 'annually') => {
  const calcPrice = (base: number, discount: number) => {
    if (cycle === 'monthly') return `₹${base}`;
    if (cycle === 'quarterly') return `₹${base * 3}`;
    return `₹${Math.round(base * 12 * (1 - discount))}`;
  };
  
  const basicFeatures = ['1000 Jobs & Sales Records', 'Up to 2 Employees', 'Import Data With Ease', 'Upload Device Images', 'Client Login', 'Advance Reports', 'Individual Dashboards', 'Attachments', 'Inventory Module', 'WhatsApp Integration', 'Quotations & Invoices', '48 Hours Support Time', 'Activity Log', 'Mobile App'];
  
  const standardFeatures = ['Unlimited Jobs & Sales Records', 'Up to 6 Employees', 'Import Data With Ease', 'Upload Device Images', 'Client Login', 'Advance Reports', 'Role-Based Access Rights', 'Individual Dashboards', 'Private & Public Chat', 'Attachments', 'Inventory Module', 'Purchase Management', 'Own Email Setup', 'Pickup Drop', 'UPI Payments', 'Bulk Payments', 'WhatsApp Integration', 'Quotations & Invoices', 'Live Support', 'Activity Log', 'Mobile App', 'AMC (Annual Maintenance Contract)', 'Outsource Management', 'Lead Management', 'Task Management', 'Expense Management', 'Configurable Permissions', 'Assigned Only Jobs to Employees', 'Digital Signature', 'OTP Verification For Delivery', 'Payment Gateway Integration (PhonePe)', 'Self Check-In', 'Data Recovery Module', 'Own Branding', 'Branches'];

  const enterpriseFeatures = [...standardFeatures];
  enterpriseFeatures[1] = 'Up to 12 Employees';

  const premiumFeatures = [...standardFeatures];
  premiumFeatures[1] = 'Unlimited Employees';
  premiumFeatures[premiumFeatures.length - 1] = '3 Branches';

  return [
    { name: 'Basic', price: calcPrice(249, 0), period: cycle === 'monthly' ? '/mo' : cycle === 'quarterly' ? '/qtr' : '/yr', features: basicFeatures, cta: 'Get Started', popular: false, badge: '' },
    { name: 'Standard', price: calcPrice(499, 0.1), period: cycle === 'monthly' ? '/mo' : cycle === 'quarterly' ? '/qtr' : '/yr', features: standardFeatures, cta: 'Upgrade to Standard', popular: true, badge: 'FLAT 10% OFF 1ST YR' },
    { name: 'Enterprise', price: calcPrice(999, 0.2), period: cycle === 'monthly' ? '/mo' : cycle === 'quarterly' ? '/qtr' : '/yr', features: enterpriseFeatures, cta: 'Get Enterprise', popular: false, badge: 'FLAT 20% OFF 1ST YR' },
    { name: 'Premium', price: calcPrice(1749, 0.2), period: cycle === 'monthly' ? '/mo' : cycle === 'quarterly' ? '/qtr' : '/yr', features: premiumFeatures, cta: 'Go Premium', popular: false, badge: 'FLAT 20% OFF 1ST YR' },
  ];
};

const roadmap = [
  { phase: 'Phase 1', title: 'Core Transformation', status: 'Completed', date: 'April 2026', items: ['Feature-based Refactoring', 'Premium SaaS UI', 'Secure Key Auth Migration'] },
  { phase: 'Phase 2', title: 'Earning Ecosystem', status: 'In Progress', date: 'May 2026', items: ['Wallet System', 'Ad Revenue Engine', 'Referral Multi-level Rewards'] },
  { phase: 'Phase 3', title: 'Advanced Automation', status: 'Planned', date: 'June 2026', items: ['AI Diagnostic Assistant', 'Auto-sync Invoicing', 'Multi-staff Roles'] },
  { phase: 'Phase 4', title: 'Global Scale', status: 'Planned', date: 'Q3 2026', items: ['Multi-store Dashboard', 'API for POS Integration', 'Mobile App Launch'] },
];

const updates = [
  { date: '24-Apr-2026', title: 'Internal Admin Chat & UI Enhancements', description: 'Launched a new Internal Chat system for admins and refined the customer tracking experience with an immersive popup interface.' },
  { date: '22-Apr-2026', title: 'Enterprise ERP Modules Launched', description: 'Major update! Added 35+ advanced modules including Expense Tracking, Lead Management, Task Assignment, and a Digital Signature Canvas.' },
  { date: '21-Apr-2026', title: 'Smart AI Chatbot Launched', description: 'Added a context-aware AI Assistant that supports Hinglish. Customers can check job status, create new jobs, and get FAQs.' },
  { date: '21-Apr-2026', title: 'Multi Services Management', description: 'Brand-new Service Catalog module: manage all your repair services with pricing ranges, turnaround times, and category grouping.' },
];

const landingServices = [
  { name: 'Screen Replacement', category: 'Mobile Repair', price: '₹800 - ₹3500', tat: '1-2 hrs', popular: true, icon: Smartphone, desc: 'Original & compatible screen replacements for all major brands with warranty.' },
  { name: 'Laptop SSD Upgrade', category: 'Laptop Repair', price: '₹1300 - ₹5000', tat: '30 min', popular: true, icon: Monitor, desc: 'Boost your PC speed instantly with NVMe/SATA SSD upgrades.' },
  { name: 'TV Panel Repair', category: 'TV / LED Repair', price: '₹1200 - ₹8000', tat: '3-5 hrs', popular: false, icon: Monitor, desc: 'LED/OLED panel fault diagnosis and chip-level repair.' },
  { name: 'Charging Port Fix', category: 'Mobile Repair', price: '₹200 - ₹600', tat: '1 hr', popular: false, icon: Wrench, desc: 'Fix charging issues, deep port cleaning & IC replacement.' },
  { name: 'Smartwatch Glass', category: 'Smartwatch Repair', price: '₹250 - ₹800', tat: '2 hrs', popular: true, icon: Wrench, desc: 'Scratch-free UV glass protector & display replacement.' },
  { name: 'Water Damage Treatment', category: 'Mobile Repair', price: '₹400 - ₹1200', tat: '24 hrs', popular: false, icon: Package, desc: 'Ultrasonic cleaning + full internal motherboard inspection.' },
];

export default function Landing() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  useEffect(() => {
    // Force default (blue) skin on homepage permanently
    document.documentElement.setAttribute('data-skin', 'default');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 text-slate-800 dark:text-slate-100">
      <NewsTicker />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-200/50 dark:border-blue-900/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Smartphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">MSM CRM</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
            <button onClick={() => setShowRoadmapModal(true)} className="text-muted-foreground hover:text-foreground transition-colors font-medium">Roadmap</button>
            <button onClick={() => setShowUpdatesModal(true)} className="text-muted-foreground hover:text-foreground transition-colors font-medium">Updates</button>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</a>
            <Button variant="outline" size="sm" onClick={() => setShowTrackModal(true)}>Track Order</Button>
            <Link to="/auth"><Button size="sm">Sign In</Button></Link>
          </nav>
          <div className="md:hidden flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTrackModal(true)}>Track</Button>
            <Link to="/auth"><Button size="sm">Sign In</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Zap className="h-4 w-4 text-primary" />
          7-Day Free Trial • No Credit Card Required
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[1.1] max-w-4xl mx-auto tracking-tighter">
          The Ultimate <span className="text-primary italic">SaaS CRM</span> for Service Experts
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your service catalog, repair jobs, inventory, sales & earnings — all in one powerful Multi-Service CRM platform.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-base px-8" onClick={() => setShowTrackModal(true)}>
            📦 Track Your Order
          </Button>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Free Forever Plan</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> GST Invoicing</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> WhatsApp Support</span>
        </div>
      </section>

      {/* Services Marquee */}
      <div className="w-full bg-primary/5 py-8 border-y border-primary/10 overflow-hidden mb-16 relative group">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-6 items-center animate-marquee whitespace-nowrap px-4 group-hover:[animation-play-state:paused]">
          {[...landingServices, ...landingServices, ...landingServices].map((service, i) => (
            <Card 
              key={i} 
              className="shrink-0 w-72 cursor-pointer hover:shadow-xl transition-all border-primary/10 hover:border-primary/40 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
              onClick={() => setSelectedService(service)}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-foreground">{service.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{service.category}</p>
                    </div>
                  </div>
                  {service.popular && <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0 animate-pulse" />}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pricing</p>
                    <p className="text-xs font-bold text-primary">{service.price}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Turnaround</p>
                    <p className="text-xs font-semibold">{service.tat}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Everything You Need</h2>
          <p className="mt-3 text-muted-foreground">Powerful features to run your mobile repair business efficiently.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="hover:shadow-xl hover:-translate-y-1 transition-all border group cursor-pointer" onClick={() => setSelectedFeature(f)}>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Simple Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>
        
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-full inline-flex relative shadow-inner">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('quarterly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'quarterly' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Quarterly
            </button>
            <button 
              onClick={() => setBillingCycle('annually')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'annually' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annually <Badge className="absolute -top-3 -right-3 bg-green-500 hover:bg-green-600 border-0 shadow-lg text-[9px] animate-pulse py-0">SAVE BIG</Badge>
            </button>
            
            {/* Sliding highlight */}
            <div 
              className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-300 shadow-md"
              style={{
                left: billingCycle === 'monthly' ? '4px' : billingCycle === 'quarterly' ? '33.33%' : '66.66%',
                width: 'calc(33.33% - 4px)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {getPlans(billingCycle).map((plan, i) => (
            <Card key={i} className={`relative overflow-hidden flex flex-col ${plan.popular ? 'border-primary shadow-xl ring-2 ring-primary/20 scale-105 z-10' : ''}`}>
              {plan.badge && (
                <div className="bg-primary text-primary-foreground text-[10px] font-black tracking-widest text-center py-1.5 uppercase">
                  {plan.badge}
                </div>
              )}
              {plan.popular && !plan.badge && (
                <div className="bg-primary text-primary-foreground text-[10px] font-black tracking-widest text-center py-1.5 uppercase">
                  POPULAR CHOICE
                </div>
              )}
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-black text-foreground tracking-tighter">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">{plan.period}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-64 mb-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <ul className="space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> 
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link to="/auth?mode=signup" className="mt-auto">
                  <Button className="w-full font-bold" variant={plan.popular ? 'default' : 'outline'} size="lg">{plan.cta}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Get In Touch</h2>
          <p className="mt-3 text-muted-foreground">We're here to help you succeed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with us directly</p>
              <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hello, I need help with RepairDesk CRM')}`, '_blank')}>
                Open WhatsApp
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us a query</p>
              <Button size="sm" variant="outline" onClick={() => window.location.href = 'mailto:krs715665@gmail.com?subject=RepairDesk Support'}>
                Send Email
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-4">Mon-Sat, 10am-7pm</p>
              <Button size="sm" variant="outline" onClick={() => window.location.href = `tel:+91${ADMIN_WHATSAPP}`}>
                +91 {ADMIN_WHATSAPP}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mb-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <Smartphone className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-black text-lg text-foreground tracking-tight">MSM CRM</span>
              </div>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Multi Service Manager CRM.<br/>Premium SaaS Solution for Repair & Sales.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-bold text-foreground mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <button onClick={() => setShowTrackModal(true)} className="text-left hover:text-primary transition-colors">Track Order</button>
                <Link to="/auth" className="hover:text-primary transition-colors">Sign In / Register</Link>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Support & Help</a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-bold text-foreground mb-3">About Us</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Founder:</span> Suraj Kumar</p>
                <p><span className="font-semibold text-foreground">Phone:</span> +91 7319884599</p>
                <p><span className="font-semibold text-foreground">Address:</span> Sheikhpura BH-PAT-14</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 text-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Built with modern technology for advanced business management
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              {selectedFeature && <selectedFeature.icon className="h-8 w-8 text-primary" />}
            </div>
            <DialogTitle className="text-2xl font-black text-center">{selectedFeature?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <p className="text-muted-foreground leading-relaxed">{selectedFeature?.desc}</p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSelectedFeature(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Details Modal */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedService?.category}</Badge>
              {selectedService?.popular && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"><Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500"/> Popular</Badge>}
            </div>
            <DialogTitle className="text-xl font-black">{selectedService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{selectedService?.desc}</p>
            <div className="bg-muted/50 rounded-xl p-4 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated Cost</p>
                  <p className="text-lg font-black text-primary">{selectedService?.price}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Turnaround Time</p>
                  <p className="text-sm font-semibold">{selectedService?.tat}</p>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSelectedService(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roadmap Modal */}
      <Dialog open={showRoadmapModal} onOpenChange={setShowRoadmapModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
          <DialogHeader className="text-center mb-6">
            <Badge className="mx-auto bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px] py-1 px-4 mb-2">The Future</Badge>
            <DialogTitle className="text-3xl font-black tracking-tighter">Product <span className="text-primary italic">Roadmap</span></DialogTitle>
            <p className="text-muted-foreground text-sm mt-2">See where we're heading. Our vision is to automate every micro-task of your service business.</p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.map((step, i) => (
              <Card key={i} className="border-primary/10 bg-card/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{step.phase}</span>
                    <Badge variant={step.status === 'Completed' ? 'default' : step.status === 'In Progress' ? 'secondary' : 'outline'} className="text-[9px] font-bold">
                      {step.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{step.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{step.date}</p>
                  </div>
                  <ul className="space-y-2 pt-3 border-t border-primary/5">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Updates Modal */}
      <Dialog open={showUpdatesModal} onOpenChange={setShowUpdatesModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
          <DialogHeader className="text-center mb-6">
            <Badge className="mx-auto bg-green-500/10 text-green-600 border-green-500/20 uppercase tracking-widest text-[10px] py-1 px-4 mb-2">Live Updates</Badge>
            <DialogTitle className="text-3xl font-black tracking-tighter">What's New <span className="text-primary">Today?</span></DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {updates.map((u, i) => (
              <div key={i} className={`space-y-3 ${i > 0 ? 'pt-6 border-t border-border/40' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-white shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight leading-tight">{u.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{u.date}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-13">
                  {u.description}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* Track Order Modal */}
      <Dialog open={showTrackModal} onOpenChange={setShowTrackModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
          <div className="bg-background rounded-3xl overflow-hidden">
            <TrackOrder isModal />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
