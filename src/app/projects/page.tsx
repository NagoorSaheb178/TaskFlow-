"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  members: User[];
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "Admin";

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Forms
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [selectedUserId, setSelectedUserId] = useState("");

  // Action loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Error states
  const [createError, setCreateError] = useState("");
  const [memberError, setMemberError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setIsCreating(true);
    setCreateError("");

    // Optimistic close and clear
    setShowCreateModal(false);
    const projectDraft = { ...newProject };
    setNewProject({ name: "", description: "" });

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectDraft),
      });

      if (res.ok) {
        // Fast refresh - we could also manually append to state here for even more speed
        fetchProjects();
      } else {
        const err = await res.json().catch(() => ({}));
        setCreateError(err.message || "Failed to create project. Please try again.");
        setShowCreateModal(true); // Re-open on error
      }
    } catch (err) {
      setCreateError("Network error. Please try again.");
      setShowCreateModal(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddMember = async () => {
    if (!currentProject || !selectedUserId) return;

    setIsAddingMember(true);
    setMemberError("");

    try {
      const res = await fetch(`/api/projects/${currentProject._id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setCurrentProject(updatedProject);
        
        // Optimistically update the main projects list too
        setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
        
        setSelectedUserId(""); 
      } else {
        const err = await res.json().catch(() => ({}));
        setMemberError(err.message || "Failed to add member. Please try again.");
      }
    } catch (err) {
      setMemberError("Network error. Please try again.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentProject) return;

    setRemovingMemberId(userId);
    setMemberError("");

    try {
      const res = await fetch(`/api/projects/${currentProject._id}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setCurrentProject(updatedProject);
        fetchProjects();
      } else {
        const err = await res.json().catch(() => ({}));
        setMemberError(err.message || "Failed to remove member. Please try again.");
      }
    } catch (err) {
      setMemberError("Network error. Please try again.");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewProject({ name: "", description: "" });
    setCreateError("");
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setCurrentProject(null);
    setSelectedUserId("");
    setMemberError("");
  };

  // Users not yet in the current project
  const availableUsers = users.filter(
    (u) => !currentProject?.members.find((m) => m._id === u._id)
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Header Section */}
        <div className="mb-stack-lg flex justify-between items-center">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">Active Projects</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {isAdmin ? "Manage all team projects" : "Your assigned projects"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden lg:flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Project</span>
            </button>
          )}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {loading ? (
            <div className="col-span-full p-8 text-center text-on-surface-variant animate-pulse">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full p-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
              No projects found.
            </div>
          ) : (
            projects.map((project, index) => {
              const colors = ["bg-primary", "bg-tertiary", "bg-secondary", "bg-error"];
              const dotColor = colors[index % colors.length];

              return (
                <div
                  key={project._id}
                  className="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/80 rounded-xl p-stack-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-stack-md gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`}></span>
                        <h3
                          className="font-h3 text-h3 text-on-surface truncate pr-2"
                          title={project.name}
                        >
                          {project.name}
                        </h3>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentProject(project);
                            setShowMemberModal(true);
                          }}
                          className="bg-surface-container-high text-on-surface-variant hover:bg-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span className="material-symbols-outlined text-[14px]">group_add</span>
                          Manage
                        </button>
                      )}
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-stack-lg">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4 border-t border-outline-variant pt-4">
                    <div className="flex -space-x-2 overflow-hidden max-w-[150px]">
                      {project.members?.slice(0, 4).map((member, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm font-bold shrink-0"
                          title={member.name}
                        >
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
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Created by
                      </span>
                      <span
                        className="font-label-sm text-label-sm text-on-surface truncate max-w-[100px]"
                        title={project.createdBy?.name}
                      >
                        {project.createdBy?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile FAB */}
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="lg:hidden fixed right-6 bottom-24 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform duration-200 z-40"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        )}

        {/* Create Project Modal */}
        {showCreateModal && isAdmin && (
          <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                <h2 className="font-h3 text-h3 text-on-surface">New Project</h2>
                <button
                  onClick={handleCloseCreateModal}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none"
                    placeholder="e.g. Website Redesign"
                  />
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none resize-none"
                    placeholder="Project details..."
                  />
                </div>

                {/* Error message */}
                {createError && (
                  <p className="text-error font-label-sm text-label-sm">{createError}</p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    disabled={isCreating}
                    className="px-5 py-2.5 rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newProject.name.trim()}
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-label-md shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating && (
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                    )}
                    {isCreating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Members Modal */}
        {showMemberModal && currentProject && isAdmin && (
          <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <h2 className="font-h3 text-h3 text-on-surface">Team Members</h2>
                </div>
                <button
                  onClick={handleCloseMemberModal}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="p-6">
                {/* Add Member Row */}
                <div className="grid grid-cols-[1fr,auto] gap-3 mb-6">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary outline-none text-body-md"
                    disabled={isAddingMember}
                  >
                    <option value="">Select User to Add</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || isAddingMember}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {isAddingMember ? (
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    )}
                    <span className="font-label-md">{isAddingMember ? "Adding..." : "Add"}</span>
                  </button>
                </div>

                {/* Error message */}
                {memberError && (
                  <p className="text-error font-label-sm text-label-sm mb-4">{memberError}</p>
                )}

                {/* Member List */}
                <div className="divide-y divide-outline-variant max-h-60 overflow-y-auto mt-4">
                  {currentProject.members.length === 0 ? (
                    <p className="text-center py-4 text-on-surface-variant font-label-md">
                      No members yet.
                    </p>
                  ) : (
                    currentProject.members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-stack-md">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-bold text-on-surface">
                              {member.name}
                            </p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={removingMemberId === member._id}
                          className="text-error p-2 hover:bg-error-container/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove member"
                        >
                          {removingMemberId === member._id ? (
                            <span className="material-symbols-outlined text-[20px] animate-spin">
                              progress_activity
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[20px]">
                              person_remove
                            </span>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
