"use client";

import React from "react";
import Link from "next/link";

const ForgotPassword = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black max-w-md w-full relative z-10 shadow-lg dark:shadow-zinc-900/50">
        <h1 className="text-zinc-900 dark:text-white text-3xl md:text-4xl font-light mb-3 text-center tracking-tight">
          Recover Password
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg mb-8 text-center leading-relaxed">
          Enter your email to receive a reset link
        </p>

        <form className="mb-6 relative">
          <label
            htmlFor="email"
            className="block text-zinc-900 dark:text-zinc-50 text-sm font-medium mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all duration-200 text-base"
              aria-label="Email address for password recovery"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 mt-6 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-all duration-200 active:scale-95 transform hover:-translate-y-0.5"
            aria-label="Send password reset link"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-zinc-600 dark:text-zinc-400 text-center text-sm mt-6 mb-8 leading-relaxed">
          We&apos;ll send you a secure link to reset your password.
        </p>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline focus:outline-none transition-colors duration-200"
              aria-label="Log in to your account"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
