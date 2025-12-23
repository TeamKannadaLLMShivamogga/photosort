
import React from 'react';
import { 
  Camera, Zap, Users, CreditCard, CheckCircle, ArrowRight, 
  Clock, Shield, Star, ChevronRight, LayoutDashboard, BrainCircuit
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20">
              <Camera className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-slate-900">PhotoSort <span className="text-[#10B981]">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            Login / Signup
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Now with AI Face Detection v2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            The Workflow OS for <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500">Modern Studios</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Stop chasing client selections via WhatsApp. Deliver stunning galleries, 
            automate sorting with AI, and collect payments instantly. 
            <span className="block mt-2 text-slate-900 font-bold">From Upload to Delivery in record time.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-[#10B981] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#059669] transition-all shadow-xl shadow-[#10B981]/30 flex items-center justify-center gap-2 active:scale-95 group"
            >
              Start for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
              View Demo Gallery
            </button>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
            <div className="bg-slate-900 rounded-[2rem] p-3 shadow-2xl border border-slate-800">
                <div className="bg-slate-800 rounded-[1.5rem] overflow-hidden relative aspect-[16/9]">
                    <img 
                        src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=2000&auto=format&fit=crop" 
                        alt="Dashboard Interface" 
                        className="w-full h-full object-cover opacity-80"
                    />
                    {/* Simulated Interface Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center">
                            <BrainCircuit className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">AI Sorting Complete</h3>
                            <p className="text-white/70 font-medium mt-2">1,450 Photos analyzed • 245 Faces grouped</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { label: 'Studios Trusted', value: '500+' },
                { label: 'Photos Processed', value: '10M+' },
                { label: 'Time Saved', value: '85%' },
                { label: 'Faster Payments', value: '3x' },
            ].map((stat, i) => (
                <div key={i} className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Everything a Pro Studio Needs</h2>
                <p className="text-slate-500 font-medium">We combined Gallery Hosting, AI Culling, and CRM into one cohesive platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        icon: BrainCircuit,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                        title: 'AI Face Sorting',
                        desc: 'Upload 5,000 wedding photos and let our AI group them by face. Clients can find their own photos in seconds.'
                    },
                    {
                        icon: CheckCircle,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        title: 'Selection Workflow',
                        desc: 'Clients select favorites on mobile. You get a locked list ready for editing. No more Excel sheets.'
                    },
                    {
                        icon: CreditCard,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50',
                        title: 'Integrated Payments',
                        desc: 'Track contract values, record payments, and gate high-res downloads until the balance is paid.'
                    },
                    {
                        icon: Shield,
                        color: 'text-slate-600',
                        bg: 'bg-slate-100',
                        title: 'Secure Delivery',
                        desc: 'Watermark raw uploads automatically. Generate expiring links for high-res downloads.'
                    },
                    {
                        icon: LayoutDashboard,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50',
                        title: 'Studio Dashboard',
                        desc: 'See all active events, pending selections, and financial health at a glance.'
                    },
                    {
                        icon: Zap,
                        color: 'text-rose-600',
                        bg: 'bg-rose-50',
                        title: 'Instant Add-ons',
                        desc: 'Upsell albums, prints, and extra edits directly within the client gallery experience.'
                    }
                ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <feature.icon className={`w-7 h-7 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="workflow" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-16 text-center">The Zero-Friction Workflow</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connector Line */}
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-700 -z-10"></div>

                {[
                    { step: '01', title: 'Upload & AI Sort', desc: 'Drag and drop RAW or JPGs. Our engine tags and sorts by face immediately.' },
                    { step: '02', title: 'Client Selection', desc: 'Clients receive a magic link. They swipe right on favorites like Tinder.' },
                    { step: '03', title: 'Edit & Deliver', desc: 'You get the selection list. Upload edits. Client approves & downloads.' },
                ].map((step, i) => (
                    <div key={i} className="relative">
                        <div className="w-24 h-24 bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-2xl font-black text-[#10B981] mb-6 mx-auto shadow-xl">
                            {step.step}
                        </div>
                        <div className="text-center max-w-xs mx-auto">
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                  <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Start for Free</h2>
                  <p className="text-indigo-100 text-lg mb-10 max-w-lg mx-auto">
                      Manage your first event completely free. Upgrade to Pro when you scale. No credit card required.
                  </p>
                  <button 
                    onClick={onGetStarted}
                    className="px-10 py-5 bg-white text-indigo-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto"
                  >
                    Create Free Account <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Camera className="text-white w-4 h-4" />
                </div>
                <span className="font-black text-lg tracking-tighter uppercase text-slate-900">PhotoSort Pro</span>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  © 2024 PhotoSort Inc. All rights reserved.
              </div>
              <div className="flex gap-6">
                  <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><div className="w-5 h-5 bg-slate-100 rounded-full"></div></a>
                  <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><div className="w-5 h-5 bg-slate-100 rounded-full"></div></a>
                  <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><div className="w-5 h-5 bg-slate-100 rounded-full"></div></a>
              </div>
          </div>
      </footer>

    </div>
  );
};

export default LandingPage;
