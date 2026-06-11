'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import type { Permission } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Removed artificial delay
      
      // Basic demo validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const role = email.includes('admin') ? 'admin' as const : 'operator' as const;
      const permissions: Permission[] = role === 'admin'
        ? [
            'view_dashboard',
            'view_incidents',
            'manage_incidents',
            'view_telemetry',
            'manage_alerts',
            'view_reports',
            'generate_reports',
            'manage_settings',
            'manage_users',
            'emergency_override'
          ]
        : [
            'view_dashboard',
            'view_incidents',
            'view_telemetry',
            'view_reports'
          ];

      login({
        id: 'USR-1',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        role,
        plant: 'Titan Industrial Complex',
        permissions
      }, 'demo-token');
      
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.04)_0%,transparent_50%)]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">AEGIS-AI</span>
          </div>
        </div>

        <div className="bg-[#050b14] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-[#7fa3c4] text-sm mt-2">Sign in to the industrial safety platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#7fa3c4] text-xs font-medium uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aegis.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0a121e] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#3a5a7a] outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#7fa3c4] text-xs font-medium uppercase">Password</label>
                <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5a7a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0a121e] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#3a5a7a] outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <p className="text-[#7fa3c4] text-xs mb-3 text-center">Demo Accounts</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => autofill('admin@aegis.ai', 'admin123')}
                className="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.08)] text-xs text-[#7fa3c4] transition-all"
              >
                Admin
              </button>
              <button 
                onClick={() => autofill('operator@aegis.ai', 'ops123')}
                className="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.08)] text-xs text-[#7fa3c4] transition-all"
              >
                Operator
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-[#7fa3c4] text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
