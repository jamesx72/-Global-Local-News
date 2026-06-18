import React, { ReactNode, useState } from 'react';
import { Home, ShieldCheck, FileText, Wallet, Users, Settings, Search, Bell, PlusCircle, CheckSquare, Bookmark, History } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Layout({ children, currentView, setCurrentView }: LayoutProps) {
  const isVerification = currentView === 'verification';

  const mainNav = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'verification', icon: <CheckSquare size={20} />, label: 'Verification Center' }, // Added for easy access
    { id: 'contributor', icon: <FileText size={20} />, label: 'My Contributions' },
    { id: 'wallet', icon: <Wallet size={20} />, label: 'My Wallet' },
    { id: 'bookmarks', icon: <Bookmark size={20} />, label: 'Saved Articles' },
    { id: 'recent', icon: <History size={20} />, label: 'Recent Articles' },
    { id: 'verified', icon: <ShieldCheck size={20} />, label: 'Verified Reports' },
    { id: 'network', icon: <Users size={20} />, label: 'Trust Network' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-surface-lowest h-16 border-b border-brand-outline-variant sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <h1 className="font-serif text-2xl font-bold text-brand-primary cursor-pointer" onClick={() => setCurrentView('home')}>
            Global Local News
          </h1>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#" className="font-semibold text-brand-primary border-b-2 border-brand-primary pb-[22px] translate-y-[11px]">World</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary transition-colors cursor-pointer">Local</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary transition-colors cursor-pointer">Politics</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary transition-colors cursor-pointer">Health</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary transition-colors cursor-pointer">Tech</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center bg-brand-surface-low rounded-full px-4 py-1.5 gap-2 border border-brand-outline-variant">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search global reports..." className="bg-transparent text-sm focus:outline-none w-48" />
          </div>
          {!isVerification && (
            <button
              onClick={() => setCurrentView('contributor')}
              className="hidden md:flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-brand-primary-container transition-colors">
              <PlusCircle size={18} /> Report Breaking News
            </button>
          )}
          <button className="text-gray-500 hover:text-brand-primary transition-colors relative p-1">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-error rounded-full block border-2 border-white"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border border-brand-outline cursor-pointer ml-1">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-brand-surface-low border-r border-brand-outline-variant flex-shrink-0 hidden lg:flex flex-col p-4 overflow-y-auto">
          <div className="mb-6 bg-brand-surface-lowest p-3 rounded-xl border border-brand-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-secondary-container rounded-full flex items-center justify-center text-brand-secondary flex-shrink-0">
                <Users size={20} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm text-brand-primary truncate">Citizen Reporter</h3>
                <div className="text-xs font-bold text-brand-secondary">Trust Score: 98</div>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {mainNav.map(item => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors ${
                    active 
                      ? 'bg-brand-secondary-container text-brand-secondary shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8">
            <button className="w-full bg-brand-primary text-white py-3 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
              Support the Mission
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto w-full bg-brand-surface scroll-smooth pb-12">
          {children}
          
          <NewsletterWidget />
        </main>
      </div>
    </div>
  );
}

function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(() => {
    return !!window.localStorage.getItem('newsletter_email');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    window.localStorage.setItem('newsletter_email', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 mt-16 mb-8">
      <div className="bg-brand-surface-low border border-brand-outline-variant p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 max-w-xl">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-primary mb-2">
            Subscribe to our Newsletter
          </h3>
          <p className="text-gray-500 text-sm md:text-base">
            Get the latest verified reports and global news delivered straight to your inbox.
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px]">
          {subscribed ? (
            <div className="bg-brand-success/10 text-brand-success px-6 py-4 rounded-xl flex items-center justify-center gap-2 border border-brand-success/20">
              <CheckSquare size={20} />
              <span className="font-semibold text-sm">Successfully Subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all"
              />
              <button
                type="submit"
                className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-primary-container transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
