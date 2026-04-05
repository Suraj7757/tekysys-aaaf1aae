import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Smartphone, Wrench, Package, ShoppingCart, BarChart3, Shield, Users, Wallet,
  Gift, Monitor, Bell, MessageCircle, ArrowRight, CheckCircle, Star, Zap, Mail,
} from 'lucide-react';

const ADMIN_WHATSAPP = '917070888119';

const features = [
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

const plans = [
  { name: 'Free', price: '₹0', period: '/month', features: ['5 Repair Jobs', '10 Inventory Items', 'Basic Reports', 'Order Tracking'], cta: 'Start Free', popular: false },
  { name: 'Pro', price: '₹499', period: '/month', features: ['Unlimited Jobs', 'Unlimited Inventory', 'Advanced Reports', 'Wallet & Earnings', 'Referral System', 'Priority Support'], cta: '7-Day Free Trial', popular: true },
  { name: 'Enterprise', price: '₹1499', period: '/month', features: ['Everything in Pro', 'Multi-staff Access', 'API Access', 'Custom Branding', 'Dedicated Support', 'Ad Revenue System'], cta: 'Contact Sales', popular: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RepairDesk</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
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
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto">
          The Complete <span className="text-primary">Mobile Repair</span> & Earning Platform
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage repair jobs, inventory, sales, earnings & referrals — all in one powerful CRM platform built for mobile repair shops.
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
            <Card key={i} className="hover:shadow-lg transition-shadow border">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Simple Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
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
              <Button size="sm" variant="outline" onClick={() => window.location.href = 'tel:+917070888119'}>
                +91 7070888119
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">RepairDesk</span>
          </div>
          <p>© {new Date().getFullYear()} RepairDesk CRM. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link to="/track" className="hover:text-foreground">Track Order</Link>
            <Link to="/auth" className="hover:text-foreground">Sign In</Link>
            <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
