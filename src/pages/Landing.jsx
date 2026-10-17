import { Link } from 'react-router-dom';
import { Cloud, Server, BarChart3, Bell, Shield, ArrowRight, Settings, Zap, Rocket, GitBranch, LifeBuoy, Activity, Clock } from 'lucide-react';
import { floatingIcons } from '../utils/floatingIcons';
import { CURRENT_YEAR } from '../utils/format';

const features = [
  { icon: Server, title: 'Instance Management', description: 'Spin up, monitor, and control your EC2 instances from a single dashboard.' },
  { icon: BarChart3, title: 'Real-Time Monitoring', description: 'Live CPU, memory, and disk metrics with historical trends and health checks.' },
  { icon: Bell, title: 'Smart Alerts', description: 'Configure thresholds and get notified instantly via email, Slack, or SMS.' },
  { icon: Shield, title: 'Enterprise Security', description: 'Role-based access control, audit logs, and two-factor authentication built in.' },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '10k+', label: 'Instances Managed' },
  { value: '50ms', label: 'Alert Latency' },
  { value: '24/7', label: 'Monitoring' },
];

const steps = [
  { icon: Rocket, title: 'Deploy in minutes', description: 'Connect your AWS account and import your instances with a single click. No agents, no downtime, no complex setup.' },
  { icon: GitBranch, title: 'Automate your workflow', description: 'Set thresholds, route alerts to Slack or email, and let CloudOps keep an eye on things while you ship.' },
  { icon: LifeBuoy, title: 'Sleep easy', description: 'Get notified the moment something looks off, with the context you need to fix it before it affects users.' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-white text-navy-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingIcons.map(({ Icon, left, top, size, delay }, i) => (
          <Icon
            key={i}
            size={size}
            className="absolute text-navy-200 animate-float"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <header className="relative z-10">
        <div className="flex items-center justify-between px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-900/20">
              <Cloud size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">CloudOps</h1>
              <p className="text-[11px] text-navy-400 font-medium tracking-wide uppercase">Command Center</p>
            </div>
          </div>
          <Link to="/signup" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative z-10 overflow-hidden">
        <div className="relative px-6 lg:px-8 py-24 lg:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-1.5 text-xs font-medium text-navy-600 shadow-sm">
            <Zap size={14} className="text-navy-900" />
            Cloud infrastructure management, simplified
          </span>
          <h2 className="mt-6 text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
            Monitor and manage your
            <br className="hidden sm:block" />
            <span className="text-navy-400"> entire cloud</span> from one place
          </h2>
          <p className="mt-6 mx-auto max-w-2xl text-base lg:text-lg text-navy-500">
            CloudOps gives your team real-time visibility into every instance, alert, and metric — so you can spot problems before your users do.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-8 py-3 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20">
              Start Free Trial
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-8 py-3 text-sm font-medium text-navy-700 hover:border-navy-900 hover:text-navy-900 transition-colors shadow-sm">
              Explore Features
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-navy-200 bg-white shadow-sm p-6">
                <p className="text-2xl lg:text-3xl font-bold text-navy-900">{stat.value}</p>
                <p className="mt-1 text-sm text-navy-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">Everything you need to run your cloud</h3>
          <p className="mt-4 text-navy-500">Powerful tools that give your whole team one source of truth for infrastructure health.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-navy-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="rounded-lg bg-navy-100 p-3 w-fit">
                <Icon size={24} className="text-navy-900" />
              </div>
              <h4 className="mt-4 text-base font-semibold">{title}</h4>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 px-6 lg:px-8 py-20 lg:py-28 bg-navy-50 border-y border-navy-200">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">Up and running in three steps</h3>
          <p className="mt-4 text-navy-500">No agents to install, no config files to babysit. Point CloudOps at your cloud and go.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative rounded-xl border border-navy-200 bg-white shadow-sm p-8">
              <span className="absolute top-6 right-6 text-4xl font-bold text-navy-100">{i + 1}</span>
              <div className="rounded-lg bg-navy-900 p-3 w-fit">
                <Icon size={24} className="text-white" />
              </div>
              <h4 className="mt-5 text-lg font-semibold">{title}</h4>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="rounded-2xl bg-navy-900 px-8 lg:px-16 py-16 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            {floatingIcons.map(({ Icon, left, top, size, delay }, i) => (
              <Icon
                key={i}
                size={size}
                className="absolute text-white/10 animate-float"
                style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
              />
            ))}
          </div>
          <div className="relative">
            <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">Ready to take control of your cloud?</h3>
            <p className="mt-4 max-w-xl mx-auto text-navy-200">Join thousands of engineers managing their infrastructure with CloudOps. Free for small teams.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-medium text-navy-900 hover:bg-navy-100 transition-colors shadow-lg">
                Start Free Trial
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-navy-400 px-8 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-navy-300">
              <span className="flex items-center gap-1.5"><Clock size={14} /> Set up in under 10 minutes</span>
              <span className="flex items-center gap-1.5"><Activity size={14} /> No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-navy-200 bg-navy-50">
        <div className="px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center">
              <Cloud size={16} className="text-white" />
            </div>
            <p className="text-sm font-semibold">CloudOps Command Center</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-navy-500">
            <Link to="/settings" className="hover:text-navy-900 transition-colors"><Settings size={16} className="inline mr-1" />Settings</Link>
          </div>
          <p className="text-xs text-navy-500">© {CURRENT_YEAR} CloudOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
