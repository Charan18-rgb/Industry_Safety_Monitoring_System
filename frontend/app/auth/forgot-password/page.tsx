'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center relative overflow-hidden bg-grid p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.06)_0%,transparent_70%)]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-widest">AEGIS-AI</span>
        </div>

        <div className="glass-card-bright p-8 rounded-2xl">
          {!submitted ? (
            <>
              <div className="mb-8">
                <Mail className="w-8 h-8 text-cyan-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                <p className="text-[#7fa3c4] text-sm mt-1">
                  Enter your registered email and we&apos;ll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#7fa3c4] text-xs font-medium tracking-widest uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@facility.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#3a5a7a] outline-none focus:border-cyan-400/50 transition-all duration-200 text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
              <p className="text-[#7fa3c4] text-sm">
                If <span className="text-cyan-400 font-mono">{email}</span> is registered, you&apos;ll receive a reset link within 5 minutes.
              </p>
            </motion.div>
          )}

          <Link href="/auth/login" className="flex items-center gap-2 text-[#7fa3c4] text-sm hover:text-cyan-400 transition-colors mt-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
