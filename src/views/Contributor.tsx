import { CloudUpload, Verified, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function Contributor() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Score Card */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-primary">Contributor Dashboard</h1>
          <p className="text-gray-600 mt-1">Empowering civic journalism through verified truth.</p>
        </div>
        
        <div className="bg-brand-surface-lowest p-5 rounded-xl shadow-sm border border-brand-outline-variant flex items-center gap-5 w-full md:w-auto">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e0e3e5" strokeWidth="4"></circle>
              <circle cx="32" cy="32" r="28" fill="none" stroke="#7d5700" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset="3.5" className="transition-all duration-1000 ease-out"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-primary">98</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Current Trust Score</p>
            <div className="flex gap-1.5 text-brand-secondary">
              <Verified size={16} fill="currentColor" className="text-brand-secondary/20" />
              <ShieldCheck size={16} fill="currentColor" className="text-brand-secondary/20" />
              <CheckCircle2 size={16} fill="currentColor" className="text-brand-secondary/20" />
            </div>
          </div>
        </div>
      </header>

      {/* New Contribution Form */}
      <section className="bg-brand-surface-lowest rounded-2xl shadow-sm border border-brand-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-outline-variant flex justify-between items-center bg-brand-surface-lowest">
          <h2 className="text-xl font-serif font-bold text-brand-primary">New Contribution</h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Institutional Standards Required</span>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          {/* Drag & Drop */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <CloudUpload className="text-gray-400 group-hover:text-brand-primary" size={24} />
            </div>
            <p className="font-semibold text-brand-primary mb-1">Drag and drop media here</p>
            <p className="text-sm text-gray-500">Photos or Videos (Max 100MB)</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Headline</label>
              <input type="text" placeholder="Enter a descriptive, objective headline..." className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg p-3 text-brand-primary font-serif font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Report</label>
              <textarea placeholder="Start writing your report here. Maintain objectivity and include witness details where possible..." rows={6} className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-shadow resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button className="px-6 py-2.5 border border-brand-primary text-brand-primary font-semibold rounded-lg hover:bg-brand-primary hover:text-white transition-colors text-sm">Save Draft</button>
            <button className="px-8 py-2.5 bg-brand-secondary-container text-brand-secondary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">Submit for Verification</button>
          </div>
        </div>
      </section>

      {/* Submissions History */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-primary">My Submissions</h2>
        
        <div className="space-y-4">
          {/* Item 1 */}
          <div className="bg-brand-surface-lowest rounded-xl border border-brand-outline-variant p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Verified</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-primary">Rising water levels in the Eastern Canal District</h3>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 font-medium text-xs">Verification Flow</span>
                  <span className="text-brand-primary font-bold text-xs">100%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-secondary-container w-1/3 border-r border-yellow-200"></div>
                  <div className="h-full bg-brand-secondary-container w-1/3 border-r border-yellow-200"></div>
                  <div className="h-full bg-brand-secondary-container w-1/3"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mt-1.5 font-semibold">
                  <span>Scan</span>
                  <span>Review</span>
                  <span>Published</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-brand-surface-lowest rounded-xl border border-brand-outline-variant p-5 shadow-sm opacity-90">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-primary-container text-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">In Review</span>
                  <span className="text-xs text-gray-400">Yesterday at 4:30 PM</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-primary">Civic assembly peaceful demonstration in Central Plaza</h3>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 font-medium text-xs">Verification Flow</span>
                  <span className="text-brand-primary font-bold text-xs">65%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-secondary-container w-1/3 border-r border-yellow-200"></div>
                  <div className="h-full bg-brand-secondary-container w-1/3 opacity-80 animate-pulse"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mt-1.5 font-semibold">
                  <span>Scan</span>
                  <span className="text-gray-700">Review</span>
                  <span>Published</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
