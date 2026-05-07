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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { status, assignee } = await req.json();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Use ObjectId comparison — string != ObjectId silently
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isAssignee = task.assignee && task.assignee.equals(userObjectId);

    if (role !== "Admin" && !isAssignee) {
      return NextResponse.json({ message: "Forbidden - Not assigned to you" }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignee && role === "Admin") updateData.assignee = assignee;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("project", "name").populate("assignee", "name email");

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}
