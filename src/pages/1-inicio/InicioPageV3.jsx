import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Server,
  Zap,
  ShieldCheck,
  Cpu,
  Globe,
  Database,
  ArrowRight,
  CheckCircle2,
  Star,
  Layers,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  HardDrive,
  Activity,
  Terminal,
  Users,
  Building2,
  ShoppingCart,
  Laptop,
  Flame,
  Gauge,
  Lock,
  Headphones,
  FileCheck,
  Play,
  Menu,
  X,
  ExternalLink,
  Check,
  RefreshCw,
  Sliders
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/seo/SEO'

// Cloud provider data
const PROVIDERS = {
  digitalocean: {
    name: 'DigitalOcean',
    badge: 'Most Popular',
    color: '#0080FF',
    plans: [
      {
        id: 'do-1',
        ram: '1 GB',
        cpu: '1 Core',
        storage: '25 GB NVMe',
        bandwidth: '1 TB',
        priceMonthly: 14,
        priceHourly: 0.0194,
        featured: false,
        specs: ['1 GB RAM', '1 Core Processor', '25 GB Storage', '1 TB Bandwidth']
      },
      {
        id: 'do-2',
        ram: '2 GB',
        cpu: '1 Core',
        storage: '50 GB NVMe',
        bandwidth: '2 TB',
        priceMonthly: 28,
        priceHourly: 0.0389,
        featured: true,
        badge: 'Recommended',
        specs: ['2 GB RAM', '1 Core Processor', '50 GB Storage', '2 TB Bandwidth']
      },
      {
        id: 'do-4',
        ram: '4 GB',
        cpu: '2 Cores',
        storage: '80 GB NVMe',
        bandwidth: '4 TB',
        priceMonthly: 54,
        priceHourly: 0.0750,
        featured: false,
        specs: ['4 GB RAM', '2 Cores Processor', '80 GB Storage', '4 TB Bandwidth']
      },
      {
        id: 'do-8',
        ram: '8 GB',
        cpu: '4 Cores',
        storage: '160 GB NVMe',
        bandwidth: '5 TB',
        priceMonthly: 99,
        priceHourly: 0.1375,
        featured: false,
        specs: ['8 GB RAM', '4 Cores Processor', '160 GB Storage', '5 TB Bandwidth']
      }
    ]
  },
  aws: {
    name: 'AWS',
    badge: 'High Availability',
    color: '#FF9900',
    plans: [
      {
        id: 'aws-1',
        ram: '2 GB',
        cpu: '2 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 38.56,
        priceHourly: 0.0536,
        featured: false,
        specs: ['2 GB RAM', '2 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'aws-2',
        ram: '4 GB',
        cpu: '2 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 91.84,
        priceHourly: 0.1276,
        featured: true,
        badge: 'Top Enterprise',
        specs: ['4 GB RAM', '2 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'aws-3',
        ram: '8 GB',
        cpu: '2 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 185.34,
        priceHourly: 0.2574,
        featured: false,
        specs: ['8 GB RAM', '2 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'aws-4',
        ram: '16 GB',
        cpu: '4 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 285.20,
        priceHourly: 0.3961,
        featured: false,
        specs: ['16 GB RAM', '4 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      }
    ]
  },
  gcp: {
    name: 'Google Cloud',
    badge: 'Ultra Fast Compute',
    color: '#4285F4',
    plans: [
      {
        id: 'gcp-1',
        ram: '1.75 GB',
        cpu: '1 vCPU',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 37.45,
        priceHourly: 0.0520,
        featured: false,
        specs: ['1.75 GB RAM', '1 vCPU', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'gcp-2',
        ram: '3.75 GB',
        cpu: '1 vCPU',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 84.90,
        priceHourly: 0.1179,
        featured: true,
        badge: 'Popular Choice',
        specs: ['3.75 GB RAM', '1 vCPU', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'gcp-3',
        ram: '7.50 GB',
        cpu: '2 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 154.20,
        priceHourly: 0.2142,
        featured: false,
        specs: ['7.50 GB RAM', '2 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      },
      {
        id: 'gcp-4',
        ram: '15 GB',
        cpu: '4 vCPUs',
        storage: '20 GB SSD',
        bandwidth: '2 GB',
        priceMonthly: 245.80,
        priceHourly: 0.3414,
        featured: false,
        specs: ['15 GB RAM', '4 vCPUs', '20 GB Storage', '2 GB Bandwidth']
      }
    ]
  }
}

// Interactive Solutions Tabs
const SOLUTIONS_TABS = [
  {
    id: 'agencies',
    title: 'Agencies',
    icon: Building2,
    heading: 'Scale client sites with zero server maintenance',
    desc: 'Empower your digital agency with automated workflows, staging environments, 1-click client billing transfer, and unlimited site hosting on dedicated resources.',
    bullets: [
      'Unlimited WordPress & PHP apps per server',
      'Granular team & client access permissions',
      '1-Click staging with seamless push/pull synchronization',
      'Automated white-label reporting & free SSL'
    ],
    stats: { primary: '4x', label: 'Faster site delivery' }
  },
  {
    id: 'ecommerce',
    title: 'eCommerce',
    icon: ShoppingCart,
    heading: 'High-converting stores that never slow down under peak load',
    desc: 'Engineered specifically for WooCommerce and Magento stores. Handle Black Friday spikes with Redis Object Cache Pro, Cloudflare Enterprise CDN, and NVMe drives.',
    bullets: [
      'Up to 300% faster checkout response times',
      'Full Cloudflare Enterprise edge page caching',
      'Built-in Redis Object Cache Pro included for free',
      'Real-time automated backups before every update'
    ],
    stats: { primary: '99.99%', label: 'Uptime SLA guaranteed' }
  },
  {
    id: 'smb',
    title: 'SMBs & Startups',
    icon: Laptop,
    heading: 'Enterprise-grade cloud speed without sysadmin complexity',
    desc: 'Launch high-performing websites in minutes. Let our intelligent platform manage security patches, OS upgrades, and server monitoring while you grow your business.',
    bullets: [
      '24/7/365 real-time live chat expert assistance',
      'Zero server configuration or CLI required',
      'Auto-healing servers with instant crash recovery',
      'Free 1st professional website migration included'
    ],
    stats: { primary: '100%', label: 'Hassle-free management' }
  },
  {
    id: 'developers',
    title: 'Developers',
    icon: Terminal,
    heading: 'Total flexibility with Git deployment, SSH, and custom stacks',
    desc: 'Deploy code straight from GitHub, GitLab, or Bitbucket. Customize PHP versions per app, manage WP-CLI, access SSH/SFTP, and run background worker queues effortlessly.',
    bullets: [
      'Automated Git deployment webhook triggers',
      'Multi-PHP version support (PHP 8.1, 8.2, 8.3 & 8.4)',
      'Dedicated IP addresses & SSH/SFTP per application',
      'Database manager & full WP-CLI / Composer support'
    ],
    stats: { primary: '< 100ms', label: 'Global TTFB edge cache' }
  }
]

// Stacked Scroll Layers Data (The full-section scroll transition effect)
const SCROLL_LAYERS = [
  {
    id: 'speed-layer',
    step: '01 / SPEED & PERFORMANCE',
    title: 'Experience up to 65% Faster Performance',
    subtitle: 'A custom-built, multi-tiered caching stack engineered for maximum throughput.',
    gradient: 'from-blue-600 to-indigo-900',
    accentColor: '#3b82f6',
    features: [
      {
        title: 'Cloudflare Enterprise CDN',
        desc: 'Global edge caching across 275+ cities with HTTP/3 & smart tiered caching.'
      },
      {
        title: 'Redis Object Cache Pro Included',
        desc: 'Accelerate dynamic database queries and eliminate backend bottlenecks.'
      },
      {
        title: 'Next-Gen NVMe Storage',
        desc: 'Up to 300% faster disk read/write speeds compared to standard SSD hosting.'
      },
      {
        title: 'Optimized PHP 8.3 & MariaDB Stack',
        desc: 'Pre-tuned Apache + Nginx reverse proxy architecture for ultra-low latency.'
      }
    ],
    badge: 'Performance Unleashed'
  },
  {
    id: 'security-layer',
    step: '02 / IRONCLAD SECURITY',
    title: 'Enterprise Protection from Day One',
    subtitle: 'Multi-layer defense system keeping your data and client websites completely secure.',
    gradient: 'from-slate-900 to-indigo-950',
    accentColor: '#6366f1',
    features: [
      {
        title: 'Cloudflare Edge WAF & Anti-DDoS',
        desc: 'Block malicious bots, brute-force attacks, and Layer 7 DDoS threats at the edge.'
      },
      {
        title: 'Free Automated 1-Click SSL',
        desc: 'Automated Let’s Encrypt SSL certificate generation and auto-renewal.'
      },
      {
        title: 'Dedicated OS Firewall & IP Whitelisting',
        desc: 'Isolate each server with strict OS-level firewall rules and IP security filters.'
      },
      {
        title: 'Regular Security Patching',
        desc: 'Continuous OS updates and vulnerability patching without disrupting uptime.'
      }
    ],
    badge: 'Bank-Grade Defense'
  },
  {
    id: 'ai-layer',
    step: '03 / INTELLIGENT COPILOT',
    title: 'Cloudways AI Copilot & Real-Time Telemetry',
    subtitle: 'AI-assisted site diagnostics, performance tuning, and anomaly detection.',
    gradient: 'from-indigo-950 to-blue-950',
    accentColor: '#818cf8',
    features: [
      {
        title: 'AI Anomaly & Slow Query Detection',
        desc: 'Instant alerts and recommendations when a plugin or query slows down your store.'
      },
      {
        title: 'Auto-Healing Server Daemons',
        desc: 'Proactive daemons monitor MySQL and web server processes, restarting failed services automatically.'
      },
      {
        title: 'Automated Site Health Audits',
        desc: 'Receive periodic actionable suggestions to improve Google Core Web Vitals.'
      },
      {
        title: 'Smart Resource Scaling Insights',
        desc: 'Predictive traffic analysis advising when to scale RAM or bandwidth seamlessly.'
      }
    ],
    badge: 'AI-Driven Simplicity'
  }
]

// FAQ Items
const FAQ_ITEMS = [
  {
    q: 'How does Cloudways differ from traditional shared or VPS hosting?',
    a: 'Cloudways provides fully managed cloud infrastructure powered by top-tier providers like DigitalOcean, AWS, and Google Cloud. Unlike shared hosting, your resources (RAM, CPU, IP) are 100% dedicated to you. Unlike unmanaged VPS, Cloudways eliminates all sysadmin work by providing automated patching, 1-click deployments, built-in enterprise caching, staging, and 24/7 expert support.'
  },
  {
    q: 'Is there a free trial and do I need a credit card?',
    a: 'Yes! You can start a 3-day free trial on DigitalOcean servers with no credit card required. You get full access to launch servers, test your applications, and benchmark performance immediately.'
  },
  {
    q: 'How does the free website migration work?',
    a: 'Every new account gets 1 free professional website migration handled end-to-end by our cloud engineering team with zero downtime. Alternatively, you can use our free automated WordPress Migration Plugin to migrate unlimited sites in minutes.'
  },
  {
    q: 'Can I scale my server resources as my website traffic grows?',
    a: 'Absolutely. With our 1-click vertical server scaling, you can upgrade your RAM, CPU, and storage on the fly in seconds with minimal or zero downtime.'
  },
  {
    q: 'Can I host multiple websites on a single server?',
    a: 'Yes! You can host unlimited websites, WordPress instances, WooCommerce stores, and PHP applications on a single server without paying per-site fees. You only pay for the underlying cloud server resources.'
  }
]

export default function InicioPageV3() {
  // Offer countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 })
  const [activeProvider, setActiveProvider] = useState('digitalocean')
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'hourly'
  const [activeSolutionTab, setActiveSolutionTab] = useState('agencies')
  const [openFaq, setOpenFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 24, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentProviderData = PROVIDERS[activeProvider]

  return (
    <div className="min-h-screen bg-[#070b1e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white antialiased overflow-x-hidden">
      <SEO
        title="Managed Cloud Hosting Platform Simplified | Qaway Cloudways V3"
        description="Experience up to 65% faster performance with managed cloud hosting trusted by high-growth businesses. 1-Click servers on DigitalOcean, AWS & Google Cloud."
      />

      {/* 1. TOP ANNOUNCEMENT BANNER WITH COUNTDOWN */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs sm:text-sm py-2 px-4 sticky top-0 z-50 shadow-md border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-yellow-400 text-blue-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider animate-pulse">
              Limited Offer
            </span>
            <span>Get <strong>40% OFF</strong> for 4 Months on all Managed Cloud Plans!</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-400/30">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>Expires in:</span>
              <span className="font-bold text-yellow-300">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
            <a
              href="#pricing"
              className="hidden md:inline-flex items-center gap-1 font-semibold text-yellow-300 hover:text-white transition-colors underline decoration-yellow-400/60"
            >
              Claim Promo <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <header className="sticky top-[37px] z-40 bg-[#0c1033]/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/inicio-v3" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#070b1e] rounded-[10px] flex items-center justify-center">
                  <CloudwaysLogoIcon className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white">cloudways</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                    V3
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">by digitalocean</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors py-2">Features</a>
              <a href="#solutions" className="hover:text-white transition-colors py-2">Solutions</a>
              <a href="#scroll-experience" className="hover:text-white transition-colors py-2">Technology</a>
              <a href="#pricing" className="hover:text-white transition-colors py-2">Pricing</a>
              <a href="#copilot" className="hover:text-white transition-colors py-2 flex items-center gap-1">
                Copilot <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-[10px] text-white px-1.5 py-0.2 rounded font-bold">AI</span>
              </a>
              <a href="#faq" className="hover:text-white transition-colors py-2">FAQ</a>
            </nav>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Log In
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0c1033] border-b border-slate-800 px-6 py-6 space-y-4"
            >
              <nav className="flex flex-col space-y-3 text-base font-medium text-slate-300">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Features</a>
                <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Solutions</a>
                <a href="#scroll-experience" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Technology</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Pricing</a>
                <a href="#copilot" onClick={() => setMobileMenuOpen(false)} className="hover:text-white flex items-center gap-2">
                  Copilot <span className="bg-blue-600 text-[10px] text-white px-1.5 rounded">AI</span>
                </a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">FAQ</a>
              </nav>
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-md"
                >
                  Start Free Trial
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-700/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Generation Managed Cloud Infrastructure</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Managed Web Hosting Built with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Intelligence</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Supercharge your websites with blazing-fast managed cloud hosting trusted by <strong>120,000+</strong> businesses. Launch on DigitalOcean, AWS, or Google Cloud in 1-click without server headaches.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start 3-Day Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </a>

                <a
                  href="#solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border border-slate-700/80 font-semibold text-base px-6 py-4 rounded-xl transition-all"
                >
                  <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
                  <span>Explore Platform Demo</span>
                </a>
              </div>

              {/* Feature Micro-points */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400 pt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Click free migration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7/365 live chat support
                </span>
              </div>

              {/* Social Proof Badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">4.8 / 5 Rating</span>
                  <span className="text-[11px] text-slate-400">G2 #1 SMB Leader</span>
                </div>

                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex text-emerald-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">4.9 / 5 Rating</span>
                  <span className="text-[11px] text-slate-400">Trustpilot Verified</span>
                </div>

                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-sm font-extrabold text-blue-400 mb-0.5">120K+</span>
                  <span className="text-xs font-bold text-white">Active Sites</span>
                  <span className="text-[11px] text-slate-400">Global Customers</span>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-1 border border-slate-700/60 shadow-2xl shadow-blue-950/80 backdrop-blur-xl">
                {/* Window Header */}
                <div className="px-4 py-3 bg-slate-900/90 rounded-t-xl border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    <span>server-production-ny-01</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-5 space-y-4 text-xs font-sans">
                  {/* Metric Tiles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Response Time</span>
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-xl font-bold text-white font-mono">68 ms</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                        <span>↑ 65% faster than shared</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Uptime Guarantee</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold text-white font-mono">99.99%</div>
                      <div className="text-[10px] text-slate-400 mt-1">30 days monitored</div>
                    </div>
                  </div>

                  {/* Active Services List */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active Stack Modules
                    </div>
                    
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-slate-200 font-medium">Cloudflare Enterprise Edge</span>
                      </div>
                      <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono">Active</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-200 font-medium">Redis Object Cache Pro</span>
                      </div>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">1.2 GB Cached</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-slate-200 font-medium">Automated Daily Backups</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">03:00 AM UTC</span>
                    </div>
                  </div>

                  {/* Quick Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-center font-medium transition-colors">
                      + Add Application
                    </button>
                    <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center font-medium transition-colors">
                      1-Click Staging
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute -bottom-5 -left-5 bg-slate-900/90 border border-slate-700 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md hidden sm:flex">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">SSL & Edge WAF</div>
                  <div className="text-[10px] text-slate-400">Auto-configured & Active</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. TRUSTED BRANDS LOGO STRIP */}
      <section className="py-10 bg-[#060919] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
            Empowering Over 120,000+ Fast-Growing Brands & Agencies Worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-bold text-xl tracking-tight text-slate-300">DIGITALOCEAN</span>
            <span className="font-bold text-xl tracking-tight text-slate-300">WOOCOMMERCE</span>
            <span className="font-bold text-xl tracking-tight text-slate-300">WORDPRESS</span>
            <span className="font-bold text-xl tracking-tight text-slate-300">CLOUDFLARE</span>
            <span className="font-bold text-xl tracking-tight text-slate-300">MAGENTO</span>
            <span className="font-bold text-xl tracking-tight text-slate-300">LARAVEL</span>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SOLUTIONS MATCHER (TABS) */}
      <section id="solutions" className="py-24 relative bg-[#090e28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              Tailored Solutions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Choose Your Perfect Managed Cloud Solution
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Whether you are an agency managing dozens of client portals or a high-traffic eCommerce store, Cloudways adapts to your workflow.
            </p>
          </div>

          {/* Solution Tabs Header */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-2xl mx-auto mb-12 shadow-lg">
            {SOLUTIONS_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeSolutionTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSolutionTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Solution Content */}
          <AnimatePresence mode="wait">
            {SOLUTIONS_TABS.filter(t => t.id === activeSolutionTab).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold">
                      Purpose-Built Architecture
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                      {item.heading}
                    </h3>
                    <p className="text-slate-300 text-base leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {item.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <a
                        href="#pricing"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/30"
                      >
                        <span>Start Free Trial for {item.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 to-blue-950/60 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
                    <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-mono">
                      {item.stats.primary}
                    </div>
                    <div className="text-base font-bold text-white">
                      {item.stats.label}
                    </div>
                    <p className="text-xs text-slate-400">
                      Measured and benchmarked across high-traffic production workloads on Cloudways infrastructure.
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 6. FULL-SECTION SCROLL TRANSITION / STACKED STICKY CARDS */}
      <section id="scroll-experience" className="py-24 bg-[#070b1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              Platform Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Maximum Speed, Security & Scalability
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Explore how each layer of our managed stack works harmoniously to keep your websites lightning fast and secure.
            </p>
          </div>

          {/* Stacked Cards Container */}
          <div className="space-y-8">
            {SCROLL_LAYERS.map((layer, index) => (
              <div
                key={layer.id}
                className="sticky top-28 rounded-3xl p-8 sm:p-12 border border-slate-700/60 shadow-2xl backdrop-blur-2xl transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(12, 16, 51, 0.98) 100%)`,
                  borderColor: layer.accentColor + '50'
                }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                      {layer.step}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {layer.title}
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
                      {layer.subtitle}
                    </p>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-400/30 whitespace-nowrap">
                    {layer.badge}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                  {layer.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-colors space-y-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                        0{fIdx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PERFORMANCE BENCHMARKS METER */}
      <section className="py-20 bg-gradient-to-b from-[#090e28] to-[#070b1e] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Speed Tests & Benchmark Results
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Say Goodbye to Slow Page Loads and Lost Conversions
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Google research shows that every 100ms delay in website response time reduces conversion rates by up to 7%. Our tuned multi-caching stack guarantees top-tier TTFB scores worldwide.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-white">Cloudways Managed Turbo Stack</span>
                    <span className="text-emerald-400 font-mono">180 ms (Super Fast)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[25%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Standard Unmanaged Cloud VPS</span>
                    <span className="text-amber-400 font-mono">520 ms</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[65%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Traditional Shared Hosting</span>
                    <span className="text-rose-400 font-mono">1,450 ms (Slow)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">3X</div>
                <div className="text-sm font-bold text-white">Faster Page Load</div>
                <p className="text-xs text-slate-400">Compared to traditional shared hosting platforms</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">85%</div>
                <div className="text-sm font-bold text-white">Less TTFB Latency</div>
                <p className="text-xs text-slate-400">Powered by Cloudflare Enterprise edge integration</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono">0 CLI</div>
                <div className="text-sm font-bold text-white">Sysadmin Required</div>
                <p className="text-xs text-slate-400">100% graphical control panel & 1-click tools</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">24/7</div>
                <div className="text-sm font-bold text-white">Live Human Support</div>
                <p className="text-xs text-slate-400">Average response time under 2 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE PRICING CALCULATOR & CLOUD SELECTOR */}
      <section id="pricing" className="py-24 bg-[#070b1e] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              Flexible & Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Pick Your Cloud Provider & Scale Instantly
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Pay only for the resources you consume. No lock-in contracts, cancel anytime, and start with a free trial.
            </p>

            {/* Provider Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {Object.keys(PROVIDERS).map((key) => {
                const p = PROVIDERS[key]
                const isActive = activeProvider === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveProvider(key)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-105'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Server className="w-4 h-4" />
                    <span>{p.name}</span>
                    <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded text-slate-300 font-normal">
                      {p.badge}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Monthly / Hourly Toggle */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'hourly' : 'monthly')}
                className="w-12 h-6 bg-slate-800 rounded-full p-0.5 transition-colors relative border border-slate-700"
              >
                <div
                  className={`w-5 h-5 bg-blue-500 rounded-full shadow-md transition-transform ${
                    billingCycle === 'hourly' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold ${billingCycle === 'hourly' ? 'text-white' : 'text-slate-400'}`}>
                Pay As You Go (Hourly)
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentProviderData.plans.map((plan) => {
              const price = billingCycle === 'monthly' ? `$${plan.priceMonthly}/mo` : `$${plan.priceHourly}/hr`
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    plan.featured
                      ? 'bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-950 border-2 border-blue-500 shadow-2xl shadow-blue-600/20 scale-[1.03] z-10'
                      : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {currentProviderData.name} Plan
                      </div>
                      <div className="text-2xl font-black text-white">{plan.ram} RAM</div>
                      <div className="text-3xl font-extrabold text-white font-mono mt-3">
                        {price}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {billingCycle === 'monthly' ? 'Billed monthly based on usage' : 'Micro-metered per hour'}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span>{plan.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span>{plan.storage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span>{plan.bandwidth}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Unlimited App Installs</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Free SSL & 24/7 Support</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Free 1st Website Migration</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <a
                      href="#pricing"
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-center block transition-all ${
                        plan.featured
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Start 3-Day Free Trial
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center text-xs text-slate-400">
            * All plans include Dedicated Firewalls, Automated Backups, Staging Environments, SSH/SFTP Access, and HTTP/3 support.
          </div>
        </div>
      </section>

      {/* 9. CLOUDWAYS COPILOT AI SHOWCASE */}
      <section id="copilot" className="py-24 bg-gradient-to-b from-[#0c1033] to-[#070b1e] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Gen AI Assistant</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Cloudways Copilot: Your 24/7 AI Site Optimization Partner
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Save hours of manual troubleshooting. Cloudways Copilot continuously analyzes your application logs, detects slow queries, alerts you of abnormal memory spikes, and generates actionable optimization recommendations.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Proactive Health Monitoring:</strong> Get instant alerts before slow plugins degrade customer checkout speeds.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Smart Resource Recommendations:</strong> Receive AI guidance on when to vertical scale RAM or adjust PHP worker threads.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Automated Core Web Vitals Audits:</strong> Keep your Google search rank high with regular speed insights.
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Chat UI Mockup */}
            <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Cloudways Copilot AI</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous Telemetry Active
                    </div>
                  </div>
                </div>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
                  v2.4 Engine
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="space-y-3.5 text-xs">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-blue-400">System Telemetry Alert</span>
                    <span className="text-[10px]">Just now</span>
                  </div>
                  <p className="text-slate-200">
                    Detected sudden <strong>+45% traffic surge</strong> on <code>/shop/checkout</code>. Redis Object Cache is active and absorbing 94% of database reads.
                  </p>
                </div>

                <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Copilot Recommendation</span>
                  </div>
                  <p className="text-slate-300">
                    Enabling Cloudflare Edge HTML caching will further drop server load by 35ms. Would you like me to enable it for this application?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px]">
                      Apply 1-Click Optimization
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-[11px]">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS & CASE STUDIES */}
      <section className="py-24 bg-[#070b1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              Verified Customer Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Loved by Fast-Growing Companies Everywhere
            </h2>
            <p className="text-slate-300 text-base">
              See why more than 120,000+ businesses and digital agencies switched to Cloudways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "Cloudways cut our eCommerce loading times from 3.4 seconds down to 0.7 seconds. Our checkout conversion rate jumped by 19% within the very first month."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                  MR
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Marcus Reed</div>
                  <div className="text-xs text-slate-400">CTO, Apex Retail Group</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "As an agency with over 60 client WordPress sites, Cloudways eliminated our need for dedicated sysadmins. Staging, backups, and cloning save us 20+ hours every week."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white">
                  SL
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Sarah Lawson</div>
                  <div className="text-xs text-slate-400">Founder, PixelCraft Digital</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "The Cloudflare Enterprise integration alone would have cost us hundreds per month elsewhere. Cloudways includes it seamlessly with zero setup hassle."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                  DK
                </div>
                <div>
                  <div className="text-sm font-bold text-white">David Kim</div>
                  <div className="text-xs text-slate-400">Head of Growth, SaaSify</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. 100% FREE MIGRATION PROMISE */}
      <section className="py-20 bg-gradient-to-r from-blue-900/40 via-indigo-950/80 to-blue-900/40 border-y border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Zero Downtime Migration
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Moving to Cloudways is 100% Risk-Free
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Our specialized cloud engineers will migrate your first website completely free without a single minute of downtime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#pricing"
                className="bg-white hover:bg-slate-100 text-blue-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                Request Free Migration
              </a>
              <a
                href="#pricing"
                className="text-white hover:text-blue-300 font-semibold text-sm px-4 py-3 underline decoration-blue-400"
              >
                Or Use Automated Migrator Plugin
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#070b1e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything you need to know about our managed cloud hosting platform.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base focus:outline-none"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-blue-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 13. BOTTOM HIGH-CONVERSION CTA BANNER */}
      <section className="py-24 bg-gradient-to-b from-[#0c1033] to-[#060919] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Ready to Supercharge Your Web Hosting Experience?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Join over 120,000+ businesses running faster, more reliable sites on Cloudways today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base px-9 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>Start 3-Day Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#solutions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base px-8 py-4 rounded-xl transition-all"
            >
              <span>Talk to Sales</span>
            </a>
          </div>
          <div className="text-xs text-slate-400">
            No credit card required • Instant 1-click server launch • Cancel anytime
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="bg-[#050713] text-slate-400 text-xs py-16 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <CloudwaysLogoIcon className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold text-white tracking-tight">cloudways</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Cloudways by DigitalOcean is a managed cloud hosting platform built for performance, reliability, and peace of mind.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Global Systems Operational</span>
              </div>
            </div>

            <div>
              <div className="text-white font-bold text-sm mb-4">Products</div>
              <ul className="space-y-2.5">
                <li><a href="#pricing" className="hover:text-white transition-colors">WordPress Hosting</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">WooCommerce Hosting</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">PHP Hosting</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Laravel Hosting</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Cloudflare Enterprise</a></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-sm mb-4">Cloud Providers</div>
              <ul className="space-y-2.5">
                <li><a href="#pricing" className="hover:text-white transition-colors">DigitalOcean</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Amazon Web Services (AWS)</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Google Cloud Platform</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Autonomous Enterprise</a></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-sm mb-4">Company & Legal</div>
              <ul className="space-y-2.5">
                <li><a href="#solutions" className="hover:text-white transition-colors">About Cloudways</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Customer Reviews</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Security Overview</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Cloudways LLC (by DigitalOcean). All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-slate-300 transition-colors">Inicio V1</Link>
              <Link to="/inicio-v3" className="text-blue-400 font-semibold">Inicio V3 (Cloudways Clone)</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Custom Cloudways Icon component
function CloudwaysLogoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
    </svg>
  )
}
