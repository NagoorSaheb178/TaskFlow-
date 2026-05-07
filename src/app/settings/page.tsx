"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";

interface User { _id: string; name: string; email: string; role: string; }

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "Admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("General");
  const [isMobile, setIsMobile] = useState(false);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true,
    taskCompleted: true,
    projectUpdates: false,
    weeklyDigest: true,
    emailAlerts: true,
    pushNotifications: false,
  });

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
    else setLoading(false);
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    alert(`Role updated to ${newRole}. (Note: Backend API needed to persist this)`);
  };

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-on-surface-variant">
          You do not have permission to view this page.
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { name: "General", icon: "edit_square" },
    { name: "Team Members", icon: "group" },
    { name: "Notifications", icon: "notifications_active" },
    { name: "Security", icon: "security" },
  ];

  const showSection = (name: string) => isMobile || activeTab === name;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto w-full px-4">
        {/* Header */}
        <section className="mb-stack-lg">
          <h1 className="font-h1 text-h1 text-on-surface mb-stack-xs">Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure your workspace and team settings.</p>
        </section>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row lg:gap-gutter">

          {/* Sidebar Navigation */}
          <nav className="flex lg:block w-full lg:w-64 shrink-0 space-y-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.name
                    ? "text-primary bg-primary-fixed/50 font-bold"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-outline-variant">
              <button
                onClick={() => setActiveTab("Danger")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === "Danger" ? "text-error bg-error-container/20 font-bold" : "text-error hover:bg-error-container/10"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Danger Zone
              </button>
            </div>
          </nav>

          {/* Content Panels */}
          <div className="flex-grow space-y-stack-lg">

            {/* ── GENERAL ── */}
            {showSection("General") && (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-primary lg:hidden">edit_square</span>
                  <h2 className="font-h3 text-h3 text-on-surface">General Settings</h2>
                </div>
                <div className="space-y-stack-md">
                  <div className="grid lg:grid-cols-3 gap-stack-md items-start">
                    <label className="font-label-md text-label-md text-on-surface-variant mt-2">Workspace Name</label>
                    <div className="lg:col-span-2">
                      <input
                        className="w-full px-stack-md py-stack-sm rounded-lg border border-outline-variant bg-surface focus:border-primary outline-none"
                        type="text"
                        defaultValue="TaskFlow Main Workspace"
                      />
                      <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">The public name of your workspace.</p>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-3 gap-stack-md items-start">
                    <label className="font-label-md text-label-md text-on-surface-variant mt-2">Description</label>
                    <div className="lg:col-span-2">
                      <textarea
                        className="w-full px-stack-md py-stack-sm rounded-lg border border-outline-variant bg-surface focus:border-primary outline-none resize-none"
                        rows={4}
                        defaultValue="Internal roadmap and task tracking for the upcoming product launch cycle."
                      />
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-3 gap-stack-md items-start">
                    <label className="font-label-md text-label-md text-on-surface-variant mt-2">Timezone</label>
                    <div className="lg:col-span-2">
                      <select className="w-full px-stack-md py-stack-sm rounded-lg border border-outline-variant bg-surface focus:border-primary outline-none">
                        <option>Asia/Kolkata (IST, UTC+5:30)</option>
                        <option>America/New_York (EST, UTC-5:00)</option>
                        <option>Europe/London (GMT, UTC+0:00)</option>
                        <option>Asia/Tokyo (JST, UTC+9:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end">
                  <button className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full active:scale-95 transition-transform">
                    Save Changes
                  </button>
                </div>
              </section>
            )}

            {/* ── TEAM MEMBERS ── */}
            {showSection("Team Members") && (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-stack-md gap-4 sm:gap-0">
                  <div className="flex items-center gap-stack-sm">
                    <span className="material-symbols-outlined text-primary lg:hidden">group</span>
                    <h2 className="font-h3 text-h3 text-on-surface">Team Members</h2>
                  </div>
                  <button className="w-full sm:w-auto justify-center bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Invite
                  </button>
                </div>
                <div className="divide-y divide-outline-variant">
                  {loading ? (
                    <div className="py-4 text-center text-on-surface-variant">Loading members...</div>
                  ) : users.length === 0 ? (
                    <div className="py-6 text-center text-on-surface-variant">No team members found.</div>
                  ) : users.map((user, idx) => {
                    const colors = [
                      "bg-secondary-container text-on-secondary-container",
                      "bg-tertiary-fixed text-on-tertiary-fixed",
                      "bg-primary-fixed text-on-primary-fixed",
                      "bg-surface-variant text-on-surface-variant",
                    ];
                    const dotClass = colors[idx % colors.length];
                    return (
                      <div key={user._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 sm:gap-0">
                        <div className="flex items-center gap-stack-md w-full sm:w-auto">
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${dotClass}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-body-md text-body-md font-bold text-on-surface truncate">{user.name}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-stack-sm w-full sm:w-auto justify-end sm:justify-start">
                          <select
                            value={user.role || "Member"}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`font-label-sm text-label-sm rounded-lg border-none py-1 pl-3 pr-8 focus:ring-0 cursor-pointer ${
                              user.role === "Admin" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                          </select>
                          <button className="text-on-surface-variant p-2 hover:bg-surface-container rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── NOTIFICATIONS ── */}
            {showSection("Notifications") && (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-primary lg:hidden">notifications_active</span>
                  <h2 className="font-h3 text-h3 text-on-surface">Notifications</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Choose what events trigger a notification for your team.
                </p>

                <div className="space-y-1">
                  {[
                    { key: "taskAssigned", label: "Task Assigned", desc: "When a task is assigned to you or a member." },
                    { key: "taskCompleted", label: "Task Completed", desc: "When a task is marked as done." },
                    { key: "projectUpdates", label: "Project Updates", desc: "Status changes and project-level announcements." },
                    { key: "weeklyDigest", label: "Weekly Digest", desc: "A weekly summary of workspace activity." },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start sm:items-center justify-between py-4 border-b border-outline-variant last:border-0 gap-4">
                      <div className="flex-1">
                        <p className="font-label-md text-label-md text-on-surface">{label}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotif(key as keyof typeof notifPrefs)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          notifPrefs[key as keyof typeof notifPrefs] ? "bg-primary" : "bg-surface-variant"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            notifPrefs[key as keyof typeof notifPrefs] ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant">
                  <p className="font-label-md text-label-md text-on-surface mb-4">Delivery Channels</p>
                  <div className="space-y-3">
                    {[
                      { key: "emailAlerts", label: "Email Alerts", icon: "email" },
                      { key: "pushNotifications", label: "Push Notifications", icon: "notifications" },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="flex items-center justify-between py-3 px-4 rounded-lg bg-surface-container gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
                          <span className="font-label-md text-label-md text-on-surface">{label}</span>
                        </div>
                        <button
                          onClick={() => toggleNotif(key as keyof typeof notifPrefs)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                            notifPrefs[key as keyof typeof notifPrefs] ? "bg-primary" : "bg-surface-variant"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              notifPrefs[key as keyof typeof notifPrefs] ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end">
                  <button className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full active:scale-95 transition-transform">
                    Save Preferences
                  </button>
                </div>
              </section>
            )}

            {/* ── SECURITY ── */}
            {showSection("Security") && (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-primary lg:hidden">security</span>
                  <h2 className="font-h3 text-h3 text-on-surface">Security</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Manage authentication and access settings for your workspace.
                </p>

                <div className="space-y-stack-md">
                  {/* Two-Factor Auth */}
                  <div className="flex items-start sm:items-center justify-between p-4 rounded-lg bg-surface-container border border-outline-variant gap-4">
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      <span className="material-symbols-outlined text-[24px] text-primary shrink-0 mt-1 sm:mt-0">verified_user</span>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">Two-Factor Authentication</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Add an extra layer of security for all members.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                        twoFactor ? "bg-primary" : "bg-surface-variant"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          twoFactor ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Session Timeout */}
                  <div className="grid lg:grid-cols-3 gap-stack-md items-start">
                    <label className="font-label-md text-label-md text-on-surface-variant mt-2">Session Timeout</label>
                    <div className="lg:col-span-2">
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full px-stack-md py-stack-sm rounded-lg border border-outline-variant bg-surface focus:border-primary outline-none"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="480">8 hours</option>
                        <option value="never">Never</option>
                      </select>
                      <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                        Auto-logout inactive users after this period.
                      </p>
                    </div>
                  </div>

                  {/* Password Policy */}
                  <div className="grid lg:grid-cols-3 gap-stack-md items-start">
                    <label className="font-label-md text-label-md text-on-surface-variant mt-2">Password Policy</label>
                    <div className="lg:col-span-2 space-y-2">
                      {[
                        "Minimum 8 characters",
                        "Require uppercase & lowercase letters",
                        "Require at least one number",
                        "Require special character (!@#$...)",
                      ].map((rule) => (
                        <div key={rule} className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                          <span className="font-label-sm text-label-sm">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="pt-2">
                    <p className="font-label-md text-label-md text-on-surface mb-3">Active Sessions</p>
                    <div className="space-y-2">
                      {[
                        { device: "Chrome on Windows", location: "Hyderabad, IN", current: true },
                        { device: "Safari on iPhone", location: "Mumbai, IN", current: false },
                      ].map(({ device, location, current }) => (
                        <div key={device} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-surface-container gap-3 sm:gap-0">
                          <div className="flex items-start sm:items-center gap-3 flex-1">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0 mt-0.5 sm:mt-0">devices</span>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">
                                {device} {current && <span className="text-primary text-xs font-bold ml-1 block sm:inline">(This device)</span>}
                              </p>
                              <p className="font-label-sm text-label-sm text-on-surface-variant">{location}</p>
                            </div>
                          </div>
                          {!current && (
                            <button className="w-full sm:w-auto font-label-sm text-label-sm text-error hover:underline text-left sm:text-right">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end">
                  <button className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full active:scale-95 transition-transform">
                    Save Security Settings
                  </button>
                </div>
              </section>
            )}

            {/* ── DANGER ZONE ── */}
            {showSection("Danger") && (
              <section className="bg-error-container/5 border border-error/20 rounded-xl p-4 lg:p-6">
                <h2 className="font-h3 text-h3 text-error mb-stack-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span>
                  Danger Zone
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border border-error/20 bg-surface">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Archive Workspace</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant lg:max-w-md">
                        Archive this workspace. Projects and tasks will be read-only. You can restore it later.
                      </p>
                    </div>
                    <button className="w-full lg:w-auto bg-surface border border-error text-error font-body-md text-body-md px-6 py-2.5 rounded-lg font-bold active:scale-95 transition-transform shrink-0">
                      Archive Workspace
                    </button>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border border-error/20 bg-surface">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Delete Workspace</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant lg:max-w-md">
                        Permanently delete this workspace, all projects, tasks, and activity logs. This action cannot be undone.
                      </p>
                    </div>
                    <button className="w-full lg:w-auto bg-error text-on-error font-body-md text-body-md px-6 py-2.5 rounded-lg font-bold active:scale-95 transition-transform shrink-0 shadow-sm">
                      Delete Workspace
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
