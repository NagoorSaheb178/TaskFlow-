"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  dueDate?: string;
  assignee?: { name: string };
  project?: { name: string };
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: { name: string };
  members: { _id: string; name: string }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";
  const role = (session?.user as any)?.role || "Member";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => { setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => { setProjects(data); setLoadingProjects(false); })
      .catch(() => setLoadingProjects(false));
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done"
  ).length;

  const perUser: Record<string, number> = {};
  tasks.forEach((t) => {
    const name = t.assignee?.name || "Unassigned";
    perUser[name] = (perUser[name] || 0) + 1;
  });

  return (
    <DashboardLayout>
      {/* Dashboard Greeting */}
      <section className="mb-stack-lg flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Welcome back, {userName}! Here is your overview.</p>
        </div>
        <Link href="/tasks" className="hidden lg:flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md shadow-lg hover:shadow-xl transition-all active:scale-95">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </Link>
      </section>

      {/* Recent Projects Section — Admin only */}
      {role === "Admin" && (
        <section className="mb-stack-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-h3 text-h3 text-on-surface">Recent Projects</h3>
            <Link href="/projects" className="font-label-md text-label-md text-primary hover:underline">
              View All Projects
            </Link>
          </div>
          {loadingProjects ? (
            <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">
              No projects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {projects.slice(0, 6).map((project, index) => {
                const colors = ["bg-primary", "bg-tertiary", "bg-secondary", "bg-error"];
                const dotColor = colors[index % colors.length];
                return (
                  <div key={project._id} className="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/80 rounded-xl p-stack-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-stack-md gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />
                          <h4 className="font-h4 text-h4 text-on-surface truncate pr-2" title={project.name}>
                            {project.name}
                          </h4>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-stack-lg">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4 border-t border-outline-variant pt-4">
                      <div className="flex -space-x-2 overflow-hidden max-w-[150px]">
                        {project.members?.slice(0, 4).map((member, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm font-bold shrink-0" title={member.name}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members?.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-on-surface-variant font-label-sm shrink-0">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Created by</span>
                        <span className="font-label-sm text-label-sm text-on-surface truncate max-w-[100px]" title={project.createdBy?.name}>
                          {project.createdBy?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Summary Cards — Admin only */}
      {role === "Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
            <p className="font-label-md text-label-md text-on-surface-variant mb-stack-xs">Total Tasks</p>
            <div className="flex items-baseline gap-2">
              <span className="font-h1 text-h1 text-primary">{total}</span>
            </div>
          </div>

          <div className="bg-error-container border border-error/20 rounded-xl p-stack-lg shadow-sm">
            <div className="flex justify-between items-start">
              <p className="font-label-md text-label-md text-on-error-container mb-stack-xs">Overdue</p>
              <span className="material-symbols-outlined text-on-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            <span className="font-h1 text-h1 text-on-error-container">{overdue}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
            <p className="font-label-md text-label-md text-on-surface-variant mb-stack-xs">Completed</p>
            <div className="flex items-baseline gap-2">
              <span className="font-h1 text-h1 text-on-surface">{done}</span>
            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-xl p-stack-lg shadow-sm flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="font-label-md opacity-90 mb-stack-xs">Completion Rate</p>
              <p className="font-h2 text-h2">{total > 0 ? Math.round((done / total) * 100) : 0}%</p>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20 pointer-events-none">
              <svg className="h-full w-full" viewBox="0 0 100 100"><rect fill="white" height="60" width="20" x="10" y="20"></rect><rect fill="white" height="80" width="20" x="40" y="10"></rect><rect fill="white" height="40" width="20" x="70" y="40"></rect></svg>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Grid — Admin only */}
      {role === "Admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left 2/3: Tasks List */}
          <section className="lg:col-span-2 space-y-stack-md">
            <div className="flex justify-between items-center mb-stack-sm">
              <h3 className="font-h3 text-h3 text-on-surface">Recent Tasks</h3>
              <Link href="/tasks" className="font-label-md text-label-md text-primary font-bold hover:underline">View All Tasks</Link>
            </div>
            <div className="space-y-stack-sm">
              {loading ? (
                <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant">No tasks found.</div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex items-start gap-stack-md hover:bg-surface-container transition-colors group">
                    <div className="pt-1">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        task.status === "Done" ? "bg-primary" :
                        task.status === "In Progress" ? "bg-tertiary-container" : "bg-surface-container-high"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className="font-body-md font-bold text-on-surface line-clamp-2 leading-tight">{task.title}</h4>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                          task.priority === "High" ? "bg-error-container text-on-error-container" :
                          task.priority === "Medium" ? "bg-secondary-container text-on-secondary-container" :
                          "bg-surface-container text-on-surface-variant"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-on-surface-variant mt-2">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== "Done" ? "text-error" : ""}`}>
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            <span className="font-label-sm text-label-sm">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span className="font-label-sm text-label-sm truncate max-w-[100px]">{task.assignee?.name || "Unassigned"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right 1/3: Analytics */}
          <aside className="space-y-gutter">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
              <h3 className="font-h3 text-h3 mb-stack-md text-on-surface">Tasks by Status</h3>
              <div className="flex flex-col items-center">
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
                      <span className="font-label-md text-label-md text-on-surface">To Do</span>
                    </div>
                    <span className="font-label-md text-on-surface font-bold">{total - done - inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                      <span className="font-label-md text-label-md text-on-surface">In Progress</span>
                    </div>
                    <span className="font-label-md text-on-surface font-bold">{inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-label-md text-label-md text-on-surface">Done</span>
                    </div>
                    <span className="font-label-md text-on-surface font-bold">{done}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-primary text-on-primary rounded-xl p-stack-lg shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-h3 text-h3 mb-stack-xs">Team Capacity</h3>
                <p className="font-body-sm text-body-sm text-primary-fixed opacity-90 mb-stack-md">
                  Tasks assigned per team member overview.
                </p>
                <div className="space-y-3 mt-4">
                  {Object.entries(perUser).slice(0, 4).map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span className="truncate pr-4 font-label-md">{name}</span>
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </DashboardLayout>
  );
}
