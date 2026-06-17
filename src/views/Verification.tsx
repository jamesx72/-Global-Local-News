import { Play, Plus, Activity, MapPin, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function Verification() {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-64px)] overflow-hidden bg-brand-surface animate-in fade-in duration-500">
      
      {/* Left Pane: Content Under Review */}
      <div className="w-full lg:w-1/2 p-6 lg:p-10 lg:pr-8 overflow-y-auto border-r border-brand-outline-variant bg-brand-surface-lowest">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-brand-secondary-container text-brand-secondary px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Breaking Report</span>
              <span className="text-gray-500 text-xs font-medium">ID: #REP-8829-QX</span>
              <span className="text-gray-400 text-xs">• Submitted 14m ago</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-brand-primary leading-tight">Unverified: Infrastructure Collapse in Northern District Metro</h1>
          </div>

          {/* Media Grid */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
              <img src="https://images.unsplash.com/photo-1517596048123-5752c08fa588?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" alt="Metro Station" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white/90 text-brand-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg backdrop-blur-sm pl-1">
                  <Play size={28} fill="currentColor" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg font-medium">
                <span>0:00 / 1:45</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> RAW FOOTAGE</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-brand-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Damage Detail" className="w-full h-full object-cover" />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-brand-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <img src="https://images.unsplash.com/photo-1549492471-a7eb2bed7ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Emergency Lights" className="w-full h-full object-cover" />
              </div>
              <button className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-surface transition-colors">
                <Plus size={24} className="mb-2" />
                <span className="text-xs font-semibold">4 More Files</span>
              </button>
            </div>
          </div>

          {/* Article Text */}
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-gray-700">
            <p className="text-lg">
              At approximately 08:45 AM local time, witnesses reported a "significant structural failure" on the lower mezzanine level of the Northern District Central Metro station. Initial reports suggest that a secondary support beam may have buckled under heavy vibration from a passing express train.
            </p>
            <p>
              "The sound was like thunder underground," says Mark Thomason, a commuter on the platform. "Dust started falling from the ceiling immediately, and security began an emergency evacuation within seconds."
            </p>
            <p>
              Local authorities have cordoned off the area. No casualties have been confirmed, but transit through the northern corridor is suspended indefinitely. This report was submitted by citizen journalist @UrbanSentinel using a Trust-Link mobile relay.
            </p>
          </div>

          {/* Author Tag */}
          <div className="bg-brand-surface p-4 rounded-xl border border-brand-outline-variant flex items-center justify-between mt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">US</div>
              <div>
                <p className="font-semibold text-brand-primary text-sm">@UrbanSentinel</p>
                <p className="text-xs text-gray-500 mt-0.5">Trust Score: 98.4 (Veteran Reporter)</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Pane: AI Report & Voting */}
      <div className="w-full lg:w-1/2 bg-[#f8fafc] p-6 lg:p-10 lg:pl-8 flex flex-col overflow-y-auto">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col space-y-8">
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-2">
              <Activity className="text-brand-primary" /> AI Trust Report
            </h2>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div> 89% CONFIDENCE
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Plagiarism Match</p>
              <h3 className="text-3xl font-bold text-brand-primary mb-3">4.2%</h3>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand-primary w-[4.2%]"></div>
              </div>
              <p className="text-xs text-gray-400 italic">Unique content. No external matches found.</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Deepfake Risk</p>
              <h3 className="text-3xl font-bold text-brand-error mb-3">12.5%</h3>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand-error w-[12.5%]"></div>
              </div>
              <p className="text-xs text-gray-400 italic">Low risk of synthesis detected in frames 24-90.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm block col-span-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Geofencing & Metadata</p>
                  <div className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-2">
                    <MapPin size={16} fill="currentColor" className="text-brand-primary/20" /> 40.7128° N, 74.0060° W
                  </div>
                  <p className="text-xs text-green-600 font-medium">✓ Device GPS matches IP exit node.</p>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Map View" className="w-full h-full object-cover mix-blend-luminosity opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-brand-secondary-container rounded-full shadow-[0_0_10px_rgba(255,194,80,1)]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm block col-span-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Integrity Log</p>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-sans font-medium">Capture Date Hash</span>
                  <span className="text-brand-primary font-semibold">Valid (SHA-256)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-sans font-medium">Exif Modification Tag</span>
                  <span className="text-brand-primary font-semibold">None Detected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans font-medium">Lens Signature Match</span>
                  <span className="text-brand-primary font-semibold">iPhone 14 Pro Max</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="font-semibold text-sm text-brand-primary">Verifier Consensus</span>
              <span className="text-xsfont-bold text-gray-500"><span className="text-brand-primary font-bold">2/3</span> Votes Collected</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex mb-2">
              <div className="h-full bg-brand-primary w-1/3 border-r border-brand-primary-container"></div>
              <div className="h-full w-1/3 bg-brand-primary/60 border-r border-gray-300"></div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Verifier 1: Approve</span>
              <span>Verifier 2: Approve</span>
              <span className="text-brand-secondary animate-pulse">Awaiting You...</span>
            </div>
          </div>

          {/* Voting Action Box */}
          <div className="bg-white p-8 rounded-2xl border-2 border-brand-primary/10 shadow-xl mt-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary-container to-brand-primary"></div>
            <h4 className="text-center text-xs font-bold text-brand-primary uppercase tracking-widest mb-6">Cast Your Final Verification</h4>
            
            <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-md mb-4 text-sm">
              <CheckCircle2 size={20} fill="currentColor" className="text-white/20" /> Approve Report
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all text-sm">
                <Info size={18} /> Request Info
              </button>
              <button className="py-3 border-2 border-brand-error/20 text-brand-error rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-50 active:scale-95 transition-all text-sm">
                <XCircle size={18} /> Reject Report
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-6 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
              By casting your vote, you confirm you have reviewed the AI Trust Report and verified the content matches current local geofencing data.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
