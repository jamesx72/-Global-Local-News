import React, { useState } from 'react';
import { CloudUpload, Verified, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Contributor() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !content.trim()) return;

    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setHeadline('');
      setContent('');
      setFile(null);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 ">
      
      {/* Header & Score Card */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-primary">Contributor Dashboard</h1>
          <p className="text-gray-500 mt-1">Empowering civic journalism through verified truth.</p>
        </div>
        
        <div className="bg-brand-surface-low p-5 rounded-xl shadow-sm border border-brand-outline flex items-center gap-5 w-full md:w-auto">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-brand-surface-lowest)" strokeWidth="4"></circle>
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-brand-secondary)" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset="3.5" className="transition-all duration-1000 ease-out"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-primary">{user ? '120' : '98'}</div>
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
      <section className="bg-brand-surface-lowest rounded-2xl shadow-sm border border-brand-outline overflow-hidden relative">
        {submitted && (
          <div className="absolute inset-0 z-10 bg-brand-surface-lowest/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">Report Submitted Successfully</h3>
            <p className="text-gray-500 text-center max-w-md">
              Thank you for your contribution. Your report is now entering our institutional verification flow.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-b border-brand-outline flex justify-between items-center bg-brand-surface-low">
          <h2 className="text-xl font-serif font-bold text-brand-primary">New Contribution</h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Institutional Standards Required</span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Drag & Drop */}
          <label className={`border-2 border-dashed ${file ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-gray-300 bg-brand-surface hover:bg-brand-surface-lowest'} rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer group`}>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-4 transition-transform ${file ? 'bg-brand-secondary text-brand-surface-lowest' : 'bg-brand-surface-lowest text-gray-400 group-hover:scale-110 group-hover:text-brand-primary'}`}>
              <CloudUpload size={24} />
            </div>
            <p className={`font-semibold mb-1 ${file ? 'text-brand-secondary' : 'text-brand-primary'}`}>
              {file ? file.name : 'Drag and drop media here'}
            </p>
            <p className="text-sm text-gray-500">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Photos or Videos (Max 100MB)'}
            </p>
          </label>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2">Headline</label>
              <input 
                type="text" 
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="Enter a descriptive, objective headline..." 
                className="w-full bg-brand-surface-lowest border border-brand-outline text-brand-primary rounded-lg p-3 font-serif font-medium focus:outline-none focus:border-brand-secondary transition-colors" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2">Detailed Report</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Start writing your report here. Maintain objectivity and include witness details where possible..." 
                rows={6} 
                className="w-full bg-brand-surface-lowest border border-brand-outline text-brand-primary rounded-lg p-4 focus:outline-none focus:border-brand-secondary transition-colors resize-none nice-scroll"
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="px-6 py-2.5 border border-brand-outline text-gray-500 font-semibold rounded-lg hover:bg-brand-surface-low transition-colors text-sm">Save Draft</button>
            <button 
              type="submit" 
              disabled={isSubmitting || !headline.trim() || !content.trim()}
              className="px-8 py-2.5 bg-brand-primary text-brand-surface-lowest font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </section>

      {/* Submissions History */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-primary">My Submissions</h2>
        
        <div className="space-y-4">
          {/* Item 1 */}
          <div className="bg-brand-surface-lowest rounded-xl border border-brand-outline p-5 shadow-sm hover:border-brand-primary/30 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-success/10 text-brand-success border border-brand-success/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Verified</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-primary">Rising water levels in the Eastern Canal District</h3>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Verification</span>
                  <span className="text-brand-success font-bold text-xs">100%</span>
                </div>
                <div className="h-1.5 w-full bg-brand-surface rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-success w-1/3 border-r border-brand-surface-lowest"></div>
                  <div className="h-full bg-brand-success w-1/3 border-r border-brand-surface-lowest"></div>
                  <div className="h-full bg-brand-success w-1/3"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-semibold">
                  <span className="text-brand-success">Scan</span>
                  <span className="text-brand-success">Review</span>
                  <span className="text-brand-success">Published</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-brand-surface-lowest rounded-xl border border-brand-outline p-5 shadow-sm hover:border-brand-primary/30 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">In Review</span>
                  <span className="text-xs text-gray-500">Yesterday at 4:30 PM</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-primary">Civic assembly peaceful demonstration in Central Plaza</h3>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Verification</span>
                  <span className="text-brand-secondary font-bold text-xs">65%</span>
                </div>
                <div className="h-1.5 w-full bg-brand-surface rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand-secondary w-1/3 border-r border-brand-surface-lowest"></div>
                  <div className="h-full bg-brand-secondary w-1/3 opacity-80 animate-pulse"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-semibold">
                  <span className="text-brand-secondary">Scan</span>
                  <span className="text-brand-secondary">Review</span>
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

