"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Start prefetching the dashboard to speed up the transition
    router.prefetch("/");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      // router.refresh() is not strictly needed for navigation speed, 
      // but if you want fresh data it's okay. 
      // However, pushing is enough for the user to see the next page.
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
            <h2 className="text-[48px] leading-[56px] font-extrabold tracking-tight">Accelerate your team's project delivery.</h2>
            <p className="text-body-lg text-primary-fixed-dim max-w-md opacity-90 leading-relaxed">Everything you need to manage complex projects, automate workflows, and hit your milestones faster than ever.</p>
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

        {/* Login Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 overflow-y-auto bg-surface-container-lowest scroll-smooth">
          <div className="lg:hidden flex flex-col items-center text-center mb-stack-lg mt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container mb-stack-md shadow-inner">
              <span className="material-symbols-outlined text-[32px]">view_kanban</span>
            </div>
            <h1 className="text-h1 text-on-surface font-extrabold tracking-tight">TaskFlow</h1>
          </div>

          <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="mb-stack-lg text-center lg:text-left">
              <h2 className="text-[28px] font-bold text-on-surface mb-2">Welcome back</h2>
              <p className="text-body-md text-on-surface-variant">Please enter your details to sign in.</p>
            </div>

            {error && (
              <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-stack-md">
              <div className="space-y-stack-xs">
                <label className="text-label-md text-on-surface-variant ml-1 font-semibold" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                  <input
                    className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant"
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
                <div className="flex justify-between items-center ml-1">
                  <label className="text-label-md text-on-surface-variant font-semibold" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-label-md text-primary font-medium hover:text-primary-container transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                  <input
                    className="w-full h-14 pl-12 pr-12 bg-surface-container-low border border-outline-variant/60 rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline-variant"
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

              <div className="flex items-center space-x-3 pt-2">
                <input className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary cursor-pointer transition-colors" id="remember" type="checkbox" />
                <label className="text-body-sm text-on-surface-variant select-none cursor-pointer font-medium" htmlFor="remember">Remember me for 30 days</label>
              </div>

              <button
                className="w-full h-14 bg-primary text-on-primary font-bold text-[15px] rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container hover:shadow-xl active:scale-[0.98] transition-all duration-200 mt-stack-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? "Signing in..." : "Login to TaskFlow"}</span>
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            <div className="text-center pt-8">
              <p className="text-body-md text-on-surface-variant">
                Don't have an account?
                <Link className="text-primary font-bold hover:underline ml-1" href="/signup">Sign up for free</Link>
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
