import React, { useState } from 'react';
import {
  Settings,
  Shield,
  User,
  Key,
  Database,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminSettingsPage() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚙️</span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            System & Nursery Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Owner credentials, system status, and security configuration for B.tech Puppybala.
        </p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Admin Profile Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <User className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Authenticated Admin Account
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Admin Name
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {admin?.name || 'Sourabh Dhakad'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Registered Email
            </span>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              {admin?.email || 'dhakadsourabh648@gmail.com'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Role & Privileges
            </span>
            <div className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="uppercase">{admin?.role || 'superadmin'}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Full Management Access)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Authentication Method
            </span>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>JWT Bearer (Bcrypt Hashed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nursery Information Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Nursery Information
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Establishment:</span>
            <span className="font-bold text-white">B.tech Puppybala</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Location:</span>
            <span className="font-bold text-white">Bhopal, Madhya Pradesh (MP)</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Concept:</span>
            <span className="font-bold text-white">100% Home-Raised, Cage-Free Nursery</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-slate-400">Enquiry Verification:</span>
            <span className="font-bold text-emerald-400">10-Digit Indian Mobile Numbers</span>
          </div>
        </div>
      </div>

      {/* Security & Session Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Security & Session
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Admin sessions are securely signed and verified on every server API request. No admin credentials are hard-coded in the frontend bundle. When you finish managing puppies and customer enquiries, you can safely log out below.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session & Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
