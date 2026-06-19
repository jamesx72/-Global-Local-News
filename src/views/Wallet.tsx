import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Download,
  CheckCircle2,
  Circle,
  Plus,
  Wallet as WalletIcon,
  ShieldAlert,
  ExternalLink,
  LogIn,
  Trash2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { useNotifications } from "../contexts/NotificationContext";

interface PaymentMethod {
  id: string;
  type: "paypal" | "stripe";
  identifier: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  title: string;
  type: string;
  amount: number;
  date: string;
}

export default function Wallet() {
  const { user, signInWithGoogle } = useAuth();
  const { addNotification } = useNotifications();
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodEmail, setNewMethodEmail] = useState("");
  const [newMethodType, setNewMethodType] = useState<"paypal" | "stripe">(
    "paypal",
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    if (!user) {
      setPaymentMethods([]);
      return;
    }
    const q = query(collection(db, `users/${user.uid}/paymentMethods`));
    const unsubscribeMethods = onSnapshot(
      q,
      (snapshot) => {
        const methods: PaymentMethod[] = [];
        snapshot.forEach((docSnap) => {
          methods.push({ id: docSnap.id, ...docSnap.data() } as PaymentMethod);
        });
        setPaymentMethods(methods);
      },
      (error) => {
        console.error("Error loading payment methods", error);
      },
    );

    const qTx = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("date", "desc"),
    );
    const unsubscribeTx = onSnapshot(
      qTx,
      (snapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          txs.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
        });
        setTransactions(txs);
      },
      (error) => {
        console.error("Error loading transactions", error);
      },
    );

    return () => {
      unsubscribeMethods();
      unsubscribeTx();
    };
  }, [user]);

  const handleAddMethod = async () => {
    if (!user || !newMethodEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/paymentMethods`), {
        type: newMethodType,
        identifier: newMethodEmail,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      });
      setIsAddingMethod(false);
      setNewMethodEmail("");
      addNotification("Payment Method Added", `Your ${newMethodType === 'paypal' ? 'PayPal' : 'Stripe'} account has been linked successfully.`, "success");
    } catch (e) {
      console.error("Error adding method", e);
      addNotification("Error", "Failed to link payment method.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id: string, type: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/paymentMethods`, id));
      addNotification("Method Removed", `Your ${type} payment method was unlinked.`, "info");
    } catch (e) {
      console.error("Error deleting method", e);
      addNotification("Error", "Could not remove payment method.", "error");
    }
  };

  const handleTopUp = async () => {
    if (!user) return;
    setIsToppingUp(true);
    try {
      const amounts = [25.0, 50.0, 100.0, 150.0];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        title: "Simulated Top-up / Bonus",
        type: "Bonus",
        amount: randomAmount,
        date: new Date().toISOString(),
      });
      addNotification("Funds Received", `A top-up of €${randomAmount.toFixed(2)} has been credited to your balance.`, "success");
    } catch (e) {
      console.error("Error adding top-up", e);
      addNotification("Deposit Failed", "Could not process the top-up at this time.", "error");
    } finally {
      setIsToppingUp(false);
    }
  };

  const currentBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const balanceParts = currentBalance.toFixed(2).split(".");

  const chartBars = [45, 62, 31, 90, 75, 52, 112, 82, 38, 68, 98, 55, 120];

  if (!user) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mb-6">
          <WalletIcon size={32} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-brand-primary mb-3">
          Earnings Dashboard
        </h2>
        <p className="text-gray-500 max-w-md mb-8">
          Sign in to manage your journalism revenue, track verifications, and
          view financial transparency logs.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand-primary/90 transition-colors flex gap-2 items-center"
        >
          <LogIn size={18} /> Connect Account
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 ">
      <div>
        <h2 className="text-3xl font-serif font-bold text-brand-primary">
          Earnings Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your journalism revenue and financial transparency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Card */}
        <div className="col-span-1 lg:col-span-5 bg-brand-surface-lowest border border-brand-outline-variant p-8 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-secondary opacity-5 -mr-20 -mt-20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>

          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">
              Current Balance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-serif font-bold text-brand-primary tracking-tight">
                €{balanceParts[0]}
              </span>
              <span className="text-3xl font-serif font-bold text-brand-secondary-container">
                .{balanceParts[1] || "00"}
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded text-sm font-semibold">
              <TrendingUp size={16} /> +12% this month
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 relative z-10">
            <button
              className="flex-1 bg-brand-primary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all text-sm shadow-sm opacity-50 cursor-not-allowed"
              title="Not enough funds or verification required"
            >
              <WalletIcon size={18} /> Withdraw Funds
            </button>
            <button
              onClick={handleTopUp}
              disabled={isToppingUp}
              className="bg-brand-surface text-brand-primary font-semibold px-6 py-3.5 rounded-xl border border-brand-outline-variant hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
            >
              <Plus size={18} className="inline mr-1" />
              {isToppingUp ? "Processing..." : "Simulate Earning"}
            </button>
          </div>
        </div>

        {/* History Chart */}
        <div className="col-span-1 lg:col-span-7 bg-brand-surface-lowest border border-brand-outline-variant p-8 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-brand-primary">
              Earnings History
            </h3>
            <div className="flex gap-1 bg-brand-surface p-1 rounded-lg border border-brand-outline-variant">
              <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white shadow-sm text-brand-primary">
                30 Days
              </button>
              <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors">
                90 Days
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] flex items-end gap-2 group">
            {chartBars.map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all duration-300 ${i === chartBars.length - 1 ? "bg-brand-secondary-container" : "bg-[#d6e3ff] hover:bg-brand-secondary-container/50"}`}
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
            <h3 className="text-xl font-serif font-bold text-brand-primary">
              Recent Payouts
            </h3>
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
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No recent payouts or transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-serif font-bold text-brand-primary">
                        {tx.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{tx.type}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-secondary">
                        €{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-auto p-4 bg-brand-surface text-center border-t border-brand-outline-variant">
            <button className="text-sm font-semibold text-brand-primary hover:underline">
              View All Transactions
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-brand-surface-lowest border border-brand-outline-variant p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">
              Payment Methods
            </h3>
            <div className="flex flex-col gap-3">
              {paymentMethods.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4 bg-brand-surface rounded-xl border border-dashed border-gray-300">
                  No payment methods configured.
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-brand-outline-variant rounded-xl group hover:border-brand-primary transition-colors hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {method.type === "paypal" ? (
                        <div className="w-10 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold font-serif text-lg">
                          P
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center text-white font-bold font-serif text-lg">
                          S
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-brand-primary capitalize">
                          {method.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {method.identifier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteMethod(method.id, method.type)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-error transition-all"
                        title="Remove method"
                      >
                        <Trash2 size={16} />
                      </button>
                      {method.isDefault ? (
                        <CheckCircle2
                          className="text-brand-primary"
                          fill="currentColor"
                          size={20}
                        />
                      ) : (
                        <Circle className="text-gray-300" size={20} />
                      )}
                    </div>
                  </div>
                ))
              )}

              {isAddingMethod ? (
                <div className="w-full mt-2 border border-brand-outline-variant p-4 rounded-xl bg-brand-surface text-sm animate-in zoom-in-95 duration-200">
                  <h4 className="font-semibold text-brand-primary mb-3">
                    Add Payment Method
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={newMethodType}
                      onChange={(e) =>
                        setNewMethodType(e.target.value as "paypal" | "stripe")
                      }
                      className="w-full px-3 py-2 border border-brand-outline-variant rounded-md focus:outline-none focus:border-brand-primary bg-white"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </select>
                    <input
                      type="email"
                      placeholder="Identifier (Email / Connection ID)"
                      value={newMethodEmail}
                      onChange={(e) => setNewMethodEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-brand-outline-variant rounded-md focus:outline-none focus:border-brand-primary"
                    />
                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-brand-outline-variant/50">
                      <button
                        onClick={() => setIsAddingMethod(false)}
                        className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMethod}
                        className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        disabled={isSubmitting || !newMethodEmail.trim()}
                      >
                        {isSubmitting ? "Saving..." : "Save Method"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingMethod(true)}
                  className="w-full mt-2 border-2 border-dashed border-gray-300 py-4 rounded-xl text-gray-500 font-semibold text-sm flex items-center justify-center gap-2 hover:border-brand-primary hover:text-brand-primary transition-colors bg-brand-surface hover:bg-brand-surface-low"
                >
                  <Plus size={18} /> Add New Method
                </button>
              )}
            </div>
          </div>

          <div className="bg-brand-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <ShieldAlert
              size={120}
              className="absolute -bottom-6 -right-6 text-white opacity-5"
            />
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-blue-200">
                Security Verification
              </h4>
              <p className="text-sm leading-relaxed opacity-90 mb-4">
                Earnings are processed after content verification. Larger
                withdrawals may require 2FA confirmation.
              </p>
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
