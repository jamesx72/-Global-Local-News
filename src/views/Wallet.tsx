import { TrendingUp, Download, CheckCircle2, Circle, Plus, Wallet as WalletIcon, ShieldAlert, ExternalLink } from 'lucide-react';

export default function Wallet() {
  const chartBars = [
    45, 62, 31, 90, 75, 52, 112, 82, 38, 68, 98, 55, 120
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 ">
      
      <div>
        <h2 className="text-3xl font-serif font-bold text-brand-primary">Earnings Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage your journalism revenue and financial transparency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Balance Card */}
        <div className="col-span-1 lg:col-span-5 bg-brand-surface-lowest border border-brand-outline-variant p-8 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-secondary opacity-5 -mr-20 -mt-20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Current Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-serif font-bold text-brand-primary tracking-tight">€2,485</span>
              <span className="text-3xl font-serif font-bold text-brand-secondary-container">.75</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded text-sm font-semibold">
              <TrendingUp size={16} /> +12% this month
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 relative z-10">
            <button className="flex-1 bg-brand-primary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all text-sm shadow-sm">
              <WalletIcon size={18} /> Withdraw Funds
            </button>
            <button className="bg-brand-surface text-brand-primary font-semibold px-6 py-3.5 rounded-xl border border-brand-outline-variant hover:bg-gray-100 transition-colors text-sm">
              Auto-Pay: Off
            </button>
          </div>
        </div>

        {/* History Chart */}
        <div className="col-span-1 lg:col-span-7 bg-brand-surface-lowest border border-brand-outline-variant p-8 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-brand-primary">Earnings History</h3>
            <div className="flex gap-1 bg-brand-surface p-1 rounded-lg border border-brand-outline-variant">
              <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white shadow-sm text-brand-primary">30 Days</button>
              <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors">90 Days</button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[200px] flex items-end gap-2 group">
            {chartBars.map((height, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-sm transition-all duration-300 ${i === chartBars.length - 1 ? 'bg-brand-secondary-container' : 'bg-[#d6e3ff] hover:bg-brand-secondary-container/50'}`}
                style={{ height: `${(height / 120) * 100}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 border-t border-brand-outline-variant pt-3 text-xs font-semibold text-gray-400">
            <span>Nov 01</span>
            <span>Today</span>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="col-span-1 lg:col-span-8 bg-brand-surface-lowest border border-brand-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-brand-outline-variant flex justify-between items-center bg-white">
            <h3 className="text-xl font-serif font-bold text-brand-primary">Recent Payouts</h3>
            <button className="text-brand-primary font-semibold text-sm flex items-center gap-1.5 hover:underline">
              Download Log <Download size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-brand-surface text-gray-500 text-xs uppercase tracking-widest font-semibold border-b border-brand-outline-variant">
                <tr>
                  <th className="px-6 py-4">Asset Source</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-outline-variant text-sm">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-serif font-bold text-brand-primary">Crowd-Sourced Flood Coverage - Valencia</td>
                  <td className="px-6 py-4 text-gray-500">Video</td>
                  <td className="px-6 py-4 text-gray-500">Nov 12, 2024</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-secondary">€150.00</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-serif font-bold text-brand-primary">Policy Reform Exclusive Interview</td>
                  <td className="px-6 py-4 text-gray-500">Article</td>
                  <td className="px-6 py-4 text-gray-500">Nov 10, 2024</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-secondary">€85.50</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-serif font-bold text-brand-primary">Downtown Protest - High Res Pack</td>
                  <td className="px-6 py-4 text-gray-500">Photo</td>
                  <td className="px-6 py-4 text-gray-500">Nov 08, 2024</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-secondary">€42.25</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-serif font-bold text-brand-primary">Weekly Engagement Bonus (Silver)</td>
                  <td className="px-6 py-4 text-gray-500">Bonus</td>
                  <td className="px-6 py-4 text-gray-500">Nov 07, 2024</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-secondary">€25.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-auto p-4 bg-brand-surface text-center border-t border-brand-outline-variant">
            <button className="text-sm font-semibold text-brand-primary hover:underline">View All Transactions</button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-brand-surface-lowest border border-brand-outline-variant p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">Payment Methods</h3>
            <div className="flex flex-col gap-3">
              
              <div className="flex items-center justify-between p-4 border border-brand-outline-variant rounded-xl cursor-pointer hover:border-brand-primary transition-colors hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold font-serif text-lg">P</div>
                  <div>
                    <p className="font-semibold text-sm text-brand-primary">PayPal</p>
                    <p className="text-xs text-gray-500">m.weaver@domain.com</p>
                  </div>
                </div>
                <CheckCircle2 className="text-brand-primary" fill="currentColor" size={20} />
              </div>

              <div className="flex items-center justify-between p-4 border border-brand-outline-variant rounded-xl cursor-pointer hover:border-brand-primary transition-colors hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center text-white font-bold font-serif text-lg">S</div>
                  <div>
                    <p className="font-semibold text-sm text-brand-primary">Stripe</p>
                    <p className="text-xs text-gray-500">Connected since 2022</p>
                  </div>
                </div>
                <Circle className="text-gray-300" size={20} />
              </div>

              <button className="w-full mt-2 border-2 border-dashed border-gray-300 py-4 rounded-xl text-gray-500 font-semibold text-sm flex items-center justify-center gap-2 hover:border-brand-primary hover:text-brand-primary transition-colors bg-gray-50/50 hover:bg-gray-50">
                <Plus size={18} /> Add New Method
              </button>
            </div>
          </div>

          <div className="bg-brand-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <ShieldAlert size={120} className="absolute -bottom-6 -right-6 text-white opacity-5" />
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-blue-200">Security Verification</h4>
              <p className="text-sm leading-relaxed opacity-90 mb-4">Earnings are processed after content verification. Larger withdrawals may require 2FA confirmation.</p>
              <button className="text-brand-secondary-container font-bold text-sm hover:underline flex items-center gap-1.5">
                View Transparency Log <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
