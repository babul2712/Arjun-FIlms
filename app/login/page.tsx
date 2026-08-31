'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Camera, AtSign, Lock, Eye, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';
import { sendLoginOTP, verifyLoginOTP } from '@/app/actions';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const envUser = process.env.NEXT_PUBLIC_ADMIN_USER || 'admin';
    const envPass = process.env.NEXT_PUBLIC_ADMIN_PASS || 'lumina2025';
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@arjunfilms.com';

    if (username === envUser && password === envPass) {
      try {
        const res = await sendLoginOTP(username, adminEmail);
        if (res.success) {
          toast.success('OTP sent to your email');
          setStep(2);
        } else {
          setError(res.error || 'Failed to send OTP');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    } else {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@arjunfilms.com';
    
    try {
      const res = await verifyLoginOTP(adminEmail, otp);
      if (res.success) {
        const user = mockUsers.find(u => u.username === 'admin') || mockUsers[0];
        login(user);
        router.push('/dashboard');
        toast.success('Login Successful');
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#e4e4ff] to-[#fef0f7] font-sans text-[#1e2229]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0066fe]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#e0e0fb]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-[#daeaa1]/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-md px-5">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] rounded-[24px] p-10 flex flex-col items-center overflow-hidden">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white p-2 flex items-center justify-center shadow-lg shadow-black/5 border border-gray-200/50 mb-4 overflow-hidden">
              <img 
                src="/logo.jpeg" 
                alt="Arjun Films" 
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <h1 className="text-[28px] leading-[1.2] font-extrabold text-[#1a1c22] tracking-tighter">
              {step === 1 ? 'Arjun Films' : 'Verification'}
            </h1>
            <p className="text-[13px] text-gray-500 mt-1 font-semibold text-center">
              {step === 1 ? 'Studio & Client Case Management' : 'We sent a one-time password to your email.'}
            </p>
          </div>

          {step === 1 ? (
            <form className="w-full space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-1 px-1">
                  <AtSign className="text-gray-500 w-5 h-5" />
                  <label className="text-[14px] font-medium text-gray-700" htmlFor="username">Username</label>
                </div>
                <input 
                  className="w-full bg-transparent border-b border-gray-300 py-3 px-1 text-[16px] focus:outline-none focus:border-[#0066fe] transition-all" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="creative.pro@arjunfilms.com" 
                  type="text"
                  required
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1 px-1">
                  <div className="flex items-center space-x-3">
                    <Lock className="text-gray-500 w-5 h-5" />
                    <label className="text-[14px] font-medium text-gray-700" htmlFor="password">Password</label>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-transparent border-b border-gray-300 py-3 px-1 text-[16px] focus:outline-none focus:border-[#0066fe] pr-10 transition-all" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button 
                    className="absolute right-2 top-3 text-gray-400 hover:text-[#0066fe]" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  disabled={isLoading}
                  className="w-full bg-[#0a0b0d] hover:bg-black text-white text-[14px] font-medium py-4 rounded-xl shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer" 
                  type="submit"
                >
                  <span>{isLoading ? 'Sending OTP...' : 'Login'}</span>
                  {!isLoading && <ArrowRight className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </form>
          ) : (
            <form className="w-full space-y-6" onSubmit={handleOTPVerify}>
              {error && (
                <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}
              
              <div>
                <div className="flex items-center space-x-3 mb-1 px-1">
                  <Mail className="text-gray-500 w-5 h-5" />
                  <label className="text-[14px] font-medium text-gray-700" htmlFor="otp">One Time Password</label>
                </div>
                <input 
                  className="w-full bg-transparent border-b border-gray-300 py-3 px-1 text-[24px] tracking-widest text-center focus:outline-none focus:border-[#0066fe] transition-all" 
                  id="otp" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="------" 
                  type="text"
                  maxLength={6}
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={isLoading}
                  className="w-full bg-[#0a0b0d] hover:bg-black text-white text-[14px] font-medium py-4 rounded-xl shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer" 
                  type="submit"
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  {!isLoading && <ArrowRight className="w-[18px] h-[18px]" />}
                </button>
                <button 
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="w-full mt-4 text-[13px] font-medium text-gray-500 hover:text-[#0066fe] transition-colors text-center cursor-pointer"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 flex justify-center space-x-6 text-gray-400 text-[12px] font-semibold">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Systems Operational</span>
          </div>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </main>
    </div>
  );
}
