"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const role = (session?.user as any)?.role || "Member";
  const name = session?.user?.name || "User";

  const navItems = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Projects", href: "/projects", icon: "folder_shared" },
    { name: "Tasks", href: "/tasks", icon: "view_kanban" },
  ];
  if (role === "Admin") {
    navItems.push({ name: "Settings", href: "/settings", icon: "settings" });
  }

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md antialiased flex min-h-[100dvh]">
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-[100dvh] sticky top-0 bg-surface border-r border-outline-variant z-50 shrink-0">
        <div className="p-6 flex items-center gap-stack-sm mb-stack-lg">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
          </div>
          <span className="font-h2 text-h2 font-bold text-primary">TaskFlow</span>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary-container active:scale-95"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant mt-auto">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-label-md text-label-md text-on-surface font-bold truncate pr-2">{name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error-container/20 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-x-hidden">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md shadow-sm flex justify-between lg:justify-end items-center h-16 px-4 lg:px-margin border-b border-outline-variant shrink-0">
          <div className="lg:hidden flex items-center gap-stack-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
            </div>
            <span className="font-h3 text-h3 font-bold text-primary">TaskFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full active:scale-95 transition-all">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-primary hover:bg-surface-container p-2 rounded-full active:scale-95 transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 pb-28 lg:p-margin lg:pb-margin mx-auto w-full max-w-[1440px] flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile BottomNavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-2 pb-safe bg-surface border-t border-outline-variant shadow-sm z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container active:scale-90"
                  : "text-on-surface-variant hover:text-primary active:scale-90"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
