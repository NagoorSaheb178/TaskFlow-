"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Member");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to sign up");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-background">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-container blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container blur-[100px]"></div>
      </div>

      {/* Main Content Card Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col lg:flex-row bg-surface-container-lowest lg:border lg:border-outline-variant lg:rounded-3xl lg:shadow-2xl lg:overflow-hidden rounded-2xl shadow-xl border border-outline-variant lg:h-[720px]">
        
        {/* Side Image/Brand Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
              <defs>
                <pattern height="10" id="grid" patternUnits="userSpaceOnUse" width="10">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect fill="url(#grid)" height="100%" width="100%"></rect>
            </svg>
          </div>
          <div className="z-10 flex items-center gap-stack-sm text-on-primary">
            <div className="w-12 h-12 rounded-xl bg-on-primary text-primary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[28px]">view_kanban</span>
            </div>
            <span className="text-h2 tracking-tight font-bold">TaskFlow</span>
          </div>
          <div className="z-10 space-y-stack-md text-on-primary">
            <h2 className="text-[48px] leading-[56px] font-extrabold tracking-tight">Start your journey with TaskFlow today.</h2>
            <p className="text-body-lg text-primary-fixed-dim max-w-md opacity-90 leading-relaxed">Join thousands of teams who have already streamlined their workflow and boosted their productivity.</p>
          </div>
          <div className="z-10 flex items-center gap-stack-md text-on-primary/80">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high overflow-hidden flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high overflow-hidden flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high overflow-hidden flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
            <p className="text-body-sm font-medium">Trusted by 500+ global teams</p>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 overflow-y-auto bg-surface-container-lowest scroll-smooth">
          <div className="lg:hidden flex flex-col items-center text-center mb-stack-lg mt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container mb-stack-md shadow-inner">
              <span className="material-symbols-outlined text-[32px]">view_kanban</span>
            </div>
            <h1 className="text-h1 text-on-surface font-extrabold tracking-tight">TaskFlow</h1>
          </div>

          <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="mb-stack-lg">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-[28px] font-bold text-on-surface">Create account</h2>
                <span className="text-label-sm text-outline font-bold">Step {step} of 3</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mb-4">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out" 
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <p className="text-body-md text-on-surface-variant">
                {step === 1 && "Let's start with your basic information"}
                {step === 2 && "Now, set up your credentials"}
                {step === 3 && "Almost done! Review your details"}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-stack-md">
              {step === 1 && (
                <div className="space-y-stack-md animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-stack-xs">
                    <label className="text-label-md text-on-surface-variant ml-1 font-semibold" htmlFor="fullName">Full Name</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">person</span>
                      <input 
                        className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        id="fullName" 
                        placeholder="John Doe" 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-stack-xs">
                    <label className="text-label-md text-on-surface-variant ml-1 font-semibold" htmlFor="role">Role</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">badge</span>
                      <select 
                        className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer" 
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-stack-md animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-stack-xs">
                    <label className="text-label-md text-on-surface-variant ml-1 font-semibold" htmlFor="email">Email Address</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                      <input 
                        className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        id="email" 
                        placeholder="name@company.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-stack-xs">
                    <label className="text-label-md text-on-surface-variant ml-1 font-semibold" htmlFor="password">Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                      <input 
                        className="w-full h-14 pl-12 pr-12 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        id="password" 
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-stack-md animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
                      <span className="text-body-sm text-on-surface-variant font-medium">Name</span>
                      <span className="text-body-md text-on-surface font-semibold">{fullName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
                      <span className="text-body-sm text-on-surface-variant font-medium">Role</span>
                      <span className="text-body-md text-on-surface font-semibold">{role}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-body-sm text-on-surface-variant font-medium">Email</span>
                      <span className="text-body-md text-on-surface font-semibold truncate max-w-[200px]" title={email}>{email}</span>
                    </div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant text-center px-4 font-medium">
                    By creating an account, you agree to our <Link href="#" className="text-primary hover:underline font-semibold">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  className="w-full h-14 bg-primary text-on-primary font-bold text-[15px] rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? "Creating account..." : step === 3 ? "Complete Registration" : "Continue"}
                  </span>
                  {!isLoading && <span className="material-symbols-outlined text-[20px]">
                    {step === 3 ? "check_circle" : "arrow_forward"}
                  </span>}
                </button>
                
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-full h-14 text-on-surface-variant font-bold text-[15px] rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    <span>Go Back</span>
                  </button>
                )}
              </div>
            </form>

            <div className="text-center pt-8">
              <p className="text-body-md text-on-surface-variant">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline ml-1" href="/login">Sign in</Link>
              </p>
            </div>
          </div>

          <div className="pt-8 lg:pt-stack-lg border-t border-outline-variant/50 mt-8 lg:mt-stack-lg">
            <div className="flex justify-center items-center gap-8">
              <div className="flex items-center gap-stack-xs text-outline hover:text-on-surface-variant transition-colors cursor-default">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-label-sm uppercase tracking-widest font-semibold">Secure</span>
              </div>
              <div className="flex items-center gap-stack-xs text-outline hover:text-on-surface-variant transition-colors cursor-default">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                <span className="text-label-sm uppercase tracking-widest font-semibold">Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-center w-full px-4 pointer-events-none hidden lg:block">
        <p className="text-label-sm text-outline-variant font-medium">© 2024 TaskFlow Technologies Inc. All rights reserved.</p>
      </div>
    </main>
  );
}
