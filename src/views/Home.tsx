import { MapPin, ZoomIn, Globe, Verified, ArrowRight, Info, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Map Section */}
      <section className="relative h-[450px] bg-[#001026] rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#001026] to-[#001026]"></div>
        
        {/* Mock Map Pulses */}
        <div className="absolute top-[30%] left-[25%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms]"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>
        <div className="absolute top-[45%] left-[65%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms] delay-75"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>
        <div className="absolute top-[15%] left-[45%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms] delay-150"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">The World in Real-Time</h2>
            <p className="text-blue-100 max-w-xl text-sm md:text-base">Citizen journalists across 140 countries are reporting verified truths as they happen.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 transition-colors backdrop-blur-sm">
              <ZoomIn size={20} />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 transition-colors backdrop-blur-sm">
              <Globe size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
            Trending Now
            <span className="px-2.5 py-0.5 bg-brand-secondary-container text-brand-secondary text-xs rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
          </h2>
          <button className="text-brand-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <article className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1541804246944-d621183204cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Train" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-brand-secondary-container text-brand-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Tech</div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-2 text-gray-500 text-xs">
                <MapPin size={14} className="text-brand-secondary" /> Tokyo, Japan
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-primary leading-snug mb-4 group-hover:text-brand-primary-container">Hyper-Rail Network Reaches Operational Milestone</h3>
              <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                  <Verified size={12} /> VERIFIED
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-error via-brand-secondary-container to-brand-success w-[92%]"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">92</span>
                </div>
              </div>
            </div>
          </article>
          
          {/* Card 2 */}
          <article className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1520601332219-94bf7be28f69?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Plaza" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-brand-secondary-container text-brand-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Politics</div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-2 text-gray-500 text-xs">
                <MapPin size={14} className="text-brand-secondary" /> London, UK
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-primary leading-snug mb-4 group-hover:text-brand-primary-container">New Transparency Bill Passes with Landmark Majority</h3>
              <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                  <Verified size={12} /> VERIFIED
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-error via-brand-secondary-container to-brand-success w-[98%]"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">98</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 */}
          <article className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Green Architecture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-brand-secondary-container text-brand-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Health</div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-2 text-gray-500 text-xs">
                <MapPin size={14} className="text-brand-secondary" /> Singapore
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-primary leading-snug mb-4 group-hover:text-brand-primary-container">Urban Air Quality Levels Hit Record Highs Follow Green Initiative</h3>
              <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                  <Verified size={12} /> VERIFIED
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-error via-brand-secondary-container to-brand-success w-[85%]"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">85</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Deep Dive Bento Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-surface-low rounded-2xl p-6 border border-brand-outline-variant">
          <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6">Live Verification Log</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            
            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-secondary shadow-sm">
              <Info className="text-brand-secondary shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4920</span>
                  <span className="text-gray-400 text-xs text-[10px]">2 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Crowdsourced images from Berlin street protest cross-referenced with satellite data. Status: Pending Cross-Check.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-success shadow-sm opacity-80">
              <CheckCircle2 className="text-brand-success shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4918</span>
                  <span className="text-gray-400 text-[10px]">15 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Water salinity levels in Amazon Basin verified by three independent sensor nodes. Status: Fully Confirmed.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-error shadow-sm">
              <AlertTriangle className="text-brand-error shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4915</span>
                  <span className="text-gray-400 text-[10px]">45 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Misinformation alert: AI-generated deepfake regarding regional ceasefire detected and flagged.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-brand-primary text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-brand-secondary opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-brand-secondary-container" size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Transparency Log</h3>
            <p className="text-blue-100 text-sm leading-relaxed">View our immutable ledger of all verification actions and editorial decisions.</p>
          </div>
          <button className="mt-8 flex items-center justify-between w-full p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
            <span className="font-semibold text-sm">Open Public Log</span>
            <ExternalLink size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
