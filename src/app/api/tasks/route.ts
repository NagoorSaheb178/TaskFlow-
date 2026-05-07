export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import mongoose from "mongoose";

const _User = User;
const _Project = Project;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!userId) {
      return NextResponse.json({ message: "Session missing user ID. Please log in again." }, { status: 401 });
    }

    // Use proper ObjectId for comparison — string comparison fails silently
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Admin sees all tasks; Member only sees tasks assigned to them
    const query = role === "Admin" ? {} : { assignee: userObjectId };

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate("project", "name")
      .populate("assignee", "name email");

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ message: "Error fetching tasks", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized - Admins only" }, { status: 403 });
    }

    await connectDB();
    const { title, description, project, assignee, priority, dueDate } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 });
    }
    if (!project) {
      return NextResponse.json({ message: "Project is required" }, { status: 400 });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      project: new mongoose.Types.ObjectId(project),
      assignee: assignee ? new mongoose.Types.ObjectId(assignee) : undefined,
      priority: priority || "Medium",
      dueDate: dueDate || undefined,
      status: "To Do",
    });

    const populated = await Task.findById(newTask._id)
      .populate("project", "name")
      .populate("assignee", "name email");

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ message: "Error creating task", error: error.message }, { status: 500 });
  }
}
