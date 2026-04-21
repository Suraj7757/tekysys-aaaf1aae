import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Smartphone, Wrench, Package, ShoppingCart, BarChart3, Shield, Users, Wallet,
  Gift, Monitor, Bell, MessageCircle, ArrowRight, CheckCircle, Star, Zap, Mail, ConciergeBell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewsTicker } from '@/components/layout/NewsTicker';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const ADMIN_WHATSAPP = '7319884599';
const SUPER_ADMIN = 'krs715665@gmail.com';

const features = [
  { icon: ConciergeBell, title: 'Multi Services Management', desc: 'Full service catalog with pricing ranges, turnaround times, categories, and status management. Mark popular services and track job counts per service.' },
  { icon: Wrench, title: 'Repair Job Management', desc: 'Track repair jobs with unique IDs, status updates, and customer notifications.' },
  { icon: Package, title: 'Inventory Management', desc: 'Full stock tracking with low-stock alerts and GST-compliant invoicing.' },
  { icon: ShoppingCart, title: 'Sales & Invoicing', desc: 'Sell inventory items with PDF invoices and WhatsApp sharing.' },
  { icon: Wallet, title: 'Wallet & Earnings', desc: 'Built-in wallet system with ad revenue, referral bonuses, and withdrawals.' },
  { icon: Gift, title: 'Referral System', desc: 'Unique referral codes, multi-level rewards, and invite tracking.' },
  { icon: Monitor, title: 'Order Tracking', desc: 'Public tracking portal for customers to check repair and sales status.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue charts, payment breakdowns, and business insights.' },
  { icon: Shield, title: 'Admin Panel', desc: 'Manage users, approve withdrawals, control ads, and monitor activity.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Real-time alerts for new jobs, status changes, and earnings.' },
  { icon: Users, title: 'Customer Management', desc: 'Complete customer database with contact history and job records.' },
];

const getPlans = (cycle: 'monthly' | 'quarterly' | 'annually') => [
  { 
    name: 'Free Trial', 
    price: '₹0', 
    period: '/30 days', 
    features: ['Full Pro Access', 'Addicted UI', '10 Repair Jobs/day', '20 Inventory Items', 'Basic Reports'], 
    cta: 'Start 30-Day Free Trial', 
    popular: false 
  },
  { 
    name: 'Pro CRM Plan', 
    price: cycle === 'monthly' ? '₹249' : cycle === 'quarterly' ? '₹699' : '₹1799', 
    period: cycle === 'monthly' ? '/month' : cycle === 'quarterly' ? '/quarter' : '/year', 
    features: ['Unlimited Jobs', 'Unlimited Inventory', 'Wallet System', 'Smart AI Chatbot', 'Deep Analytics', 'Priority Support'], 
    cta: 'Get Started Pro', 
    popular: true 
  },
  { 
    name: 'Enterprise / Franchise', 
    price: 'Custom', 
    period: '/lifetime', 
    features: ['Multi-store Dashboard', 'API Access', 'Dedicated Manager', 'Custom Domain', 'White-label App'], 
    cta: 'Contact Sales', 
    popular: false 
  },
];

const roadmap = [
  { phase: 'Phase 1', title: 'Core Transformation', status: 'Completed', date: 'April 2026', items: ['Feature-based Refactoring', 'Premium SaaS UI', 'Secure Key Auth Migration'] },
  { phase: 'Phase 2', title: 'Earning Ecosystem', status: 'In Progress', date: 'May 2026', items: ['Wallet System', 'Ad Revenue Engine', 'Referral Multi-level Rewards'] },
  { phase: 'Phase 3', title: 'Advanced Automation', status: 'Planned', date: 'June 2026', items: ['AI Diagnostic Assistant', 'Auto-sync Invoicing', 'Multi-staff Roles'] },
  { phase: 'Phase 4', title: 'Global Scale', status: 'Planned', date: 'Q3 2026', items: ['Multi-store Dashboard', 'API for POS Integration', 'Mobile App Launch'] },
];

const updates = [
  { date: '21-Apr-2026', title: 'Smart AI Chatbot Launched', description: 'Added a context-aware AI Assistant that supports Hinglish. Customers can now check job status directly via Tracking ID, create new repair jobs step-by-step, and get answers to FAQs seamlessly.' },
  { date: '21-Apr-2026', title: 'Critical Bug Fixes & Optimization', description: 'Resolved build errors, optimized chunk sizes, and stabilized the production bundle. Fixed edge-cases in the tracking logic and improved overall rendering speed.' },
  { date: '21-Apr-2026', title: 'Multi Services Management Launched', description: 'Brand-new Service Catalog module: manage all your repair services with pricing ranges, turnaround times, category grouping, popular markers, grid & table views, and full CRUD — all in one premium UI.' },
  { date: '21-Apr-2026', title: 'Identity & Experience Upgrade', description: 'Replaced OTP with secure Secret Key authentication, enhanced Signup flow with auto-login redirection, and launched the immersive Feature Showreel.' },
];

export default function Landing() {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  return (
    <div className="min-h-screen bg-background">
      <NewsTicker />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Smartphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">MSM CRM</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Roadmap</a>
            <a href="#updates" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Updates</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</a>
            <Link to="/track"><Button variant="outline" size="sm">Track Order</Button></Link>
            <Link to="/auth"><Button size="sm">Sign In</Button></Link>
          </nav>
          <div className="md:hidden flex gap-2">
            <Link to="/track"><Button variant="outline" size="sm">Track</Button></Link>
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
          <Link to="/track">
            <Button variant="outline" size="lg" className="text-base px-8">
              📦 Track Your Order
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Free Forever Plan</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> GST Invoicing</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> WhatsApp Support</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16">
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

      {/* Roadmap Section */}
      <section id="roadmap" className="container mx-auto px-4 py-24 bg-muted/20 rounded-[3rem] my-16 border border-primary/5">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px] py-1 px-4">The Future</Badge>
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">Product <span className="text-primary italic">Roadmap</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">See where we're heading. Our vision is to automate every micro-task of your service business.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roadmap.map((step, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => setSelectedRoadmap(step)}>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
              <Card className="relative h-full border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden pt-8 group-hover:border-primary/30 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 to-transparent" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{step.phase}</span>
                    <Badge variant={step.status === 'Completed' ? 'default' : step.status === 'In Progress' ? 'secondary' : 'outline'} className="text-[9px] font-bold">
                      {step.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{step.date}</p>
                  </div>
                  <ul className="space-y-2 pt-4 border-t border-primary/5">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Update Center (Today's Changes) */}
      <section id="updates" className="container mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-6">
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 uppercase tracking-widest text-[10px] py-1 px-4">Live Updates</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">What's New <span className="text-primary">Today?</span></h2>
            <p className="text-muted-foreground leading-relaxed">
              We update MSM CRM daily. Our team is constantly fixing bugs, improving security, and adding features requested by our partners.
            </p>
            <div className="p-8 bg-card border border-primary/10 rounded-[2rem] shadow-2xl shadow-primary/5 space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                 <Badge className="bg-primary text-white font-bold animate-pulse">Live Now</Badge>
               </div>
               {updates.map((u, i) => (
                 <div key={i} className={`space-y-4 ${i > 0 ? 'pt-4 border-t border-border/40' : ''}`}>
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
                       <Zap className="h-5 w-5" />
                     </div>
                     <div>
                       <h4 className="text-lg font-black tracking-tight">{u.title}</h4>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{u.date}</p>
                     </div>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed pl-14">
                     {u.description}
                   </p>
                 </div>
               ))}
               <ul className="pl-4 space-y-2 pt-4 border-t border-border/40">
                 <li className="flex items-center gap-2 text-xs font-bold text-primary">
                   <CheckCircle className="h-3.5 w-3.5" /> Multi Services Management module launched
                 </li>
                 <li className="flex items-center gap-2 text-xs font-bold text-primary">
                   <CheckCircle className="h-3.5 w-3.5" /> Grid & Table dual-view for service catalog
                 </li>
                 <li className="flex items-center gap-2 text-xs font-bold text-primary">
                   <CheckCircle className="h-3.5 w-3.5" /> Pricing ranges, TAT & category grouping added
                 </li>
                 <li className="flex items-center gap-2 text-xs font-bold text-primary">
                   <CheckCircle className="h-3.5 w-3.5" /> Replaced OTP with Direct Secret Key access
                 </li>
                 <li className="flex items-center gap-2 text-xs font-bold text-primary">
                   <CheckCircle className="h-3.5 w-3.5" /> Dashboard stat card links to Services Catalog
                 </li>
               </ul>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[120px] opacity-20" />
             <div className="relative gradient-primary rounded-[3rem] p-12 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10 space-y-6">
                   <h3 className="text-4xl font-black text-white tracking-tighter italic">"The only CRM that grows as fast as your business."</h3>
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/20 border border-white/20" />
                      <div>
                        <p className="text-white font-bold">Suraj Singh</p>
                        <p className="text-white/60 text-xs font-medium">Founder, MSM Systems</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {getPlans(billingCycle).map((plan, i) => (
            <Card key={i} className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star className="h-3 w-3" /> Popular
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'}>{plan.cta}</Button>
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
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Smartphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-black text-lg text-foreground tracking-tight">MSM CRM</span>
          </div>
          <p>© {new Date().getFullYear()} Multi Service Manager CRM. Premium SaaS Solution.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link to="/track" className="hover:text-foreground">Track Order</Link>
            <Link to="/auth" className="hover:text-foreground">Sign In</Link>
            <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>

      {/* Feature Details Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              {selectedFeature?.icon && <selectedFeature.icon className="h-6 w-6 text-primary" />}
            </div>
            <DialogTitle className="text-2xl font-black">{selectedFeature?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground leading-relaxed">{selectedFeature?.desc}</p>
            <div className="bg-muted p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Key Benefits</h4>
              <ul className="grid grid-cols-1 gap-2">
                {[
                  "Optimized for speed and efficiency",
                  "Real-time data synchronization",
                  "Secure and encrypted data handling",
                  "Mobile-friendly interface"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSelectedFeature(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roadmap Details Dialog */}
      <Dialog open={!!selectedRoadmap} onOpenChange={() => setSelectedRoadmap(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{selectedRoadmap?.phase}</Badge>
              <Badge variant={selectedRoadmap?.status === 'Completed' ? 'default' : selectedRoadmap?.status === 'In Progress' ? 'secondary' : 'outline'}>
                {selectedRoadmap?.status}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-black">{selectedRoadmap?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scheduled for {selectedRoadmap?.date}</p>
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Planned Achievements:</h4>
              <div className="space-y-2">
                {selectedRoadmap?.items.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSelectedRoadmap(null)}>Close View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
