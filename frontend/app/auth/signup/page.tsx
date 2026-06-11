'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User as UserIcon, Mail, Lock, Building, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    plant: '',
    role: 'operator'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Removed artificial delay
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center relative overflow-hidden bg-grid p-8">
      {/* Glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.06)_0%,transparent_60%)]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-widest">AEGIS-AI</span>
        </div>

        <div className="glass-card-bright p-8 rounded-2xl">
          {!isSubmitted ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Request Access</h2>
                <p className="text-[#7fa3c4] text-sm mt-1">Register for an account on the AEGIS platform</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#3a5a7a] outline-none focus:border-cyan-400/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@aegis.ai"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#3a5a7a] outline-none focus:border-cyan-400/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#3a5a7a] outline-none focus:border-cyan-400/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-1.5">Facility / Plant</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                    <select
                      value={form.plant}
                      onChange={(e) => setForm({ ...form, plant: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#3a5a7a] outline-none focus:border-cyan-400/50 transition-all text-sm appearance-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" disabled style={{ background: '#040c14' }}>Select facility...</option>
                      <option value="plant-7" style={{ background: '#040c14' }}>Titan Industrial Complex - Plant 7</option>
                      <option value="plant-3" style={{ background: '#040c14' }}>Helios Energy Station - Plant 3</option>
                      <option value="plant-9" style={{ background: '#040c14' }}>Kronos Manufacturing - Plant 9</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-1.5">Requested Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white outline-none focus:border-cyan-400/50 transition-all text-sm"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="operator" style={{ background: '#040c14' }}>Operator</option>
                    <option value="safety_officer" style={{ background: '#040c14' }}>Safety Officer</option>
                    <option value="plant_manager" style={{ background: '#040c14' }}>Plant Manager</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Request Submitted</h3>
              <p className="text-[#7fa3c4] text-sm mb-6">
                Your account request has been sent to the administrators for approval. You will receive an email once your access is granted.
              </p>
              <Link href="/auth/login" className="inline-block py-2.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all">
                Return to Login
              </Link>
            </motion.div>
          )}

          {!isSubmitted && (
            <div className="mt-6 text-center">
              <p className="text-[#3a5a7a] text-xs">
                Already have access?{' '}
                <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
