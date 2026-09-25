import { Link } from 'react-router-dom';
import {
  Leaf, Satellite, CloudRain, Brain, ShieldCheck,
  ArrowRight, Star, TrendingUp, Zap, Globe, ChevronRight, Activity
} from 'lucide-react';

const features = [
  {
    icon: <Satellite className="w-6 h-6" />,
    title: 'Satellite NDVI Monitoring',
    desc: 'Real-time vegetation health indices from Google Earth Engine satellite imagery, updated continuously.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: <CloudRain className="w-6 h-6" />,
    title: 'Weather Intelligence',
    desc: 'Hyper-local 7-day forecasts with heavy rain risk alerts, temperature trends, and drought detection.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Gemini AI Advisory',
    desc: 'Google Gemini 2.0 analyzes your farm\'s live data and delivers grounded, actionable farming advice.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Risk Scoring Engine',
    desc: 'Composite climate, crop, water, and soil risk scores help you act before disaster strikes.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Yield Prediction',
    desc: 'Historical ML model trained on India crop data predicts seasonal yield based on your inputs.',
    color: 'from-violet-500 to-pink-500',
    bg: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Crop Suitability',
    desc: 'See which crops match your current soil, weather, and irrigation conditions with suitability scores.',
    color: 'from-teal-500 to-green-500',
    bg: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime', sub: 'Real-time satellite data' },
  { value: '12+', label: 'Data Sources', sub: 'Fused intelligence' },
  { value: '<2s', label: 'Analysis Speed', sub: 'Live AI advisory' },
  { value: 'BRICS', label: 'Compliant', sub: 'Agriculture standards' },
];

const testimonials = [
  {
    quote: "The AI advisory told me to delay irrigation by 2 days because of rainfall forecast. Saved me 40% of water that week.",
    name: "Rajesh Kumar",
    role: "Rice Farmer, Assam",
    initials: "RK",
    color: "from-emerald-400 to-teal-500",
  },
  {
    quote: "Risk scoring helped me switch from Cotton to Maize before the drought hit. AgroResilience literally saved my harvest.",
    name: "Priya Sharma",
    role: "Farm Owner, Punjab",
    initials: "PS",
    color: "from-indigo-400 to-purple-500",
  },
  {
    quote: "The Gemini chat is incredible — I ask it questions in Hindi and it answers as if it knows my specific field conditions.",
    name: "Amitabh Singh",
    role: "Sugarcane Farmer, UP",
    initials: "AS",
    color: "from-orange-400 to-red-500",
  },
];

const steps = [
  { n: '01', title: 'Register & Draw Your Farm', desc: 'Create an account and use our interactive map to draw your farm boundary with a polygon tool.' },
  { n: '02', title: 'Launch AI Analysis', desc: 'Our pipeline fetches live satellite NDVI, real weather, and soil data specific to your location.' },
  { n: '03', title: 'Get Actionable Insights', desc: 'Receive Gemini AI advisory, risk scores, crop suitability, and yield predictions instantly.' },
];

export default function LandingPage() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="/hero.jpg" alt="Farm AI" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>

        {/* Floating animated orbs */}
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              Powered by Google Gemini 2.0 & Earth Engine
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Farm smarter.<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Grow resilient.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
                AgroResilience fuses satellite imagery, weather intelligence, soil science, and Google AI to give Indian farmers real-time, actionable insights — before problems happen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={isLoggedIn ? '/farms' : '/register'}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 text-lg"
              >
                {isLoggedIn ? 'Open My Farms' : 'Start For Free'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-white/10">
              {['🛰️ Satellite NDVI', '🌧️ Weather Forecast', '🤖 Gemini AI', '🌱 Risk Engine', '🎯 Yield Prediction'].map(b => (
                <span key={b} className="text-sm text-slate-400 font-medium">{b}</span>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                <p className="text-emerald-300 font-semibold text-sm">{s.label}</p>
                <p className="text-slate-400 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Activity className="w-3.5 h-3.5" /> Simple 3-Step Process
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">From field to intelligence<br /><span className="text-emerald-600">in minutes</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">No complex setup. No technical expertise needed. Just your farm details and our AI does the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 -translate-y-1/2" />
            {steps.map((step, i) => (
              <div key={step.n} className="relative group">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-emerald-200">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Zap className="w-3.5 h-3.5" /> Full Intelligence Suite
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Everything your farm needs<br /><span className="text-emerald-600">in one place</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={f.textColor}>{f.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                <div className={`mt-6 flex items-center gap-2 ${f.textColor} text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Trusted by farmers <span className="text-emerald-600">across India</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gradient-to-br from-slate-50 to-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover opacity-10" />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5" /> Built for the future of Indian agriculture
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Ready to transform<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">your farming?</span>
          </h2>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Join farmers who are already using AI-powered intelligence to grow more, risk less, and farm smarter.
          </p>
          <Link
            to={isLoggedIn ? '/farms' : '/register'}
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group"
          >
            {isLoggedIn ? 'Open My Farms' : 'Get Started Free — No Credit Card'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">AgroResilience</span>
          </div>
          <p className="text-sm">© 2026 AgroResilience · Built for the Hack2Skill BRICS Agriculture Challenge</p>
          <div className="flex items-center gap-1 text-sm">
            <span>Powered by</span>
            <span className="text-emerald-400 font-semibold">Google Gemini & Earth Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
