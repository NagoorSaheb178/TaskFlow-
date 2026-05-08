"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  project: { _id: string; name: string };
  assignee?: { _id: string; name: string; email: string };
  dueDate?: string;
}

interface Project { _id: string; name: string; }
interface User { _id: string; name: string; email: string; }

export default function TasksPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "Admin";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [newTask, setNewTask] = useState({
    title: "", description: "", project: "", assignee: "", priority: "Medium", dueDate: "",
  });

  useEffect(() => {
    fetchTasks();
    if (isAdmin) { fetchProjects(); fetchUsers(); }
  }, [isAdmin]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!newTask.title.trim() || !newTask.project) return setFormError("Title and Project are required.");

    // Optimistic close and reset
    setShowModal(false);
    const taskDraft = { ...newTask };
    setNewTask({ title: "", description: "", project: "", assignee: "", priority: "Medium", dueDate: "" });

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskDraft),
    });

    if (res.ok) {
      fetchTasks();
    } else {
      const data = await res.json();
      setFormError(data.message || "Failed to create task.");
      setShowModal(true); // Re-open on error
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    // Optimistically update the status locally
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: status as any } : t));

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // No need to fetchTasks() again if we update state optimistically, 
    // unless we want to sync complex server logic. 
    // fetchTasks(); 
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  };

  const renderColumn = (status: "To Do" | "In Progress" | "Done", title: string, colorClass: string, dotClass: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <section className="flex flex-col gap-stack-md w-full">
        <div className="flex items-center justify-between sticky top-0 bg-background py-1 z-10">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-5 rounded-full ${dotClass}`}></div>
            <h2 className={`font-h3 text-[18px] font-semibold text-on-surface ${status === "Done" ? "opacity-50" : ""}`}>{title}</h2>
            <span className="bg-surface-container-high px-2 py-0.5 rounded-full font-label-sm text-label-sm text-on-surface-variant">
              {columnTasks.length}
            </span>
            {status === "To Do" && isAdmin && (
              <button 
                onClick={() => setShowModal(true)} 
                className="w-8 h-8 flex items-center justify-center bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-on-primary transition-all active:scale-90 shadow-sm ml-1"
                title="Add task to this column"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            )}
          </div>
        </div>

        <div className={`flex flex-col gap-stack-sm pb-4 overflow-y-auto h-full pr-1 hide-scrollbar ${status === "Done" ? "opacity-60" : ""}`}>
          {columnTasks.map(task => (
            <article key={task._id} className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-stack-sm">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-md font-label-md text-label-md ${
                    task.priority === "High" ? "bg-error-container text-on-error-container" :
                    task.priority === "Medium" ? "bg-secondary-container text-on-secondary-container" :
                    "bg-surface-container text-on-surface-variant"
                  } ${status === "Done" ? "line-through" : ""}`}>
                    {task.priority}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="bg-transparent border-none text-on-surface-variant font-label-sm focus:ring-0 cursor-pointer p-0 pr-4 appearance-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => handleDelete(task._id)} className="material-symbols-outlined text-error text-[18px] hover:scale-110 transition-transform">
                        delete
                      </button>
                    )}
                  </div>
                </div>

                <h3 className={`font-body-md text-body-md font-bold text-on-surface break-words ${status === "Done" ? "line-through" : ""}`}>
                  {task.title}
                </h3>
                {task.project && (
                  <p className="font-label-sm text-label-sm text-primary truncate pr-2">{task.project.name}</p>
                )}

                <div className="flex items-center justify-between mt-stack-xs">
                  {task.dueDate ? (
                    <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && status !== "Done" ? "text-error" : "text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span className="font-label-sm text-label-sm">
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ) : <div></div>}

                  {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm ring-2 ring-surface shrink-0">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <section className="mb-stack-lg flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Tasks Board</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and track all project tasks.</p>
        </div>
        {isAdmin && (
          <div className="hidden lg:flex gap-2">
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md flex items-center gap-1 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Task
            </button>
          </div>
        )}
      </section>

      {/* Kanban Board Container */}
      <div className="flex-1 flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory pb-12 -mx-4 px-4 scroll-smooth hide-scrollbar lg:overflow-x-visible">
        <div className="min-w-[85vw] md:min-w-[320px] snap-center">
          {renderColumn("To Do", "To Do", "border-outline-variant", "bg-primary")}
        </div>
        <div className="min-w-[85vw] md:min-w-[320px] snap-center">
          {renderColumn("In Progress", "In Progress", "border-primary ring-1 ring-primary", "bg-tertiary-container")}
        </div>
        <div className="min-w-[85vw] md:min-w-[320px] snap-center">
          {renderColumn("Done", "Done", "border-outline-variant", "bg-secondary")}
        </div>
      </div>

      {/* Mobile FAB */}
      {isAdmin && (
        <button onClick={() => setShowModal(true)} className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform duration-200 z-40">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      )}

      {/* Create Task Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-h3 text-h3 text-on-surface">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              {formError && (
                <div className="bg-error-container text-on-error-container p-3 rounded-md font-label-sm">{formError}</div>
              )}

              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Task Title *</label>
                <input
                  type="text" required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Project *</label>
                  <select required value={newTask.project} onChange={(e) => setNewTask({ ...newTask, project: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Assignee</label>
                  <select value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-label-md shadow-md active:scale-95 transition-transform">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
