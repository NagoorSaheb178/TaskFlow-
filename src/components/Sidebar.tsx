"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, ShieldAlert } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-slate-800 text-white"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-slate-900 text-white h-full shadow-2xl">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-md bg-slate-800"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Sidebar Header */}
            <div className="p-6 flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-wide">ProjSync</span>
            </div>
            /* User Info */
            <div className="px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-indigo-400">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    {role === "Admin" && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                    {role}
                  </div>
                </div>
              </div>
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            {/* Sign out */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 text-white h-screen flex-col fixed left-0 top-0 shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">ProjSync</span>
        </div>
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-indigo-400">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                {role === "Admin" && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                {role}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
