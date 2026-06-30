import React from 'react';
import { X, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export default function ProfileModal({ isOpen, onClose, onProfileClick, onSettingsClick }: ProfileModalProps) {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />
      <div className="absolute right-6 top-16 mt-2 w-72 bg-brand-surface-lowest rounded-2xl shadow-xl border border-brand-outline-variant z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-5 flex flex-col items-center border-b border-brand-outline-variant relative">
          <button 
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-gray-400 hover:bg-brand-surface-low rounded-full transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-brand-surface-low">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-primary text-brand-surface-lowest flex items-center justify-center">
                <User size={24} />
              </div>
            )}
          </div>
          
          <h3 className="font-serif font-bold text-lg text-brand-primary">{user.displayName || 'Citizen Reporter'}</h3>
          <p className="text-xs text-gray-500 truncate w-full text-center">{user.email}</p>
          
          <div className="mt-3 bg-brand-surface-low px-3 py-1 rounded-full border border-brand-outline-variant flex gap-2 items-center">
            <span className="w-2 h-2 bg-brand-success rounded-full block border border-brand-surface-lowest"></span>
            <span className="text-xs font-bold text-brand-secondary">Trust Score: 120</span>
          </div>
        </div>

        <div className="p-2 flex flex-col gap-1">
          <button 
            onClick={() => {
              onClose();
              onProfileClick();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-surface-low transition-colors w-full text-left"
          >
            <User size={18} className="text-gray-400" />
            My Profile
          </button>
          <button 
            onClick={() => {
              onClose();
              onSettingsClick();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-surface-low transition-colors w-full text-left"
          >
            <SettingsIcon size={18} className="text-gray-400" />
            Account Settings
          </button>
          <button 
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-error hover:bg-brand-error/10 transition-colors w-full text-left"
          >
            <LogOut size={18} className="text-brand-error/70" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
