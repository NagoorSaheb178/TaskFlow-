import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";

const _User = User;

// POST /api/projects/[id]/members  — Add a member
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized - Admins only" }, { status: 403 });
    }

    await connectDB();
    const { userId } = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const memberExists = project.members.some((m: any) => m.toString() === userId);
    if (memberExists) {
      return NextResponse.json({ message: "User is already a member" }, { status: 400 });
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("POST /api/projects/[id]/members error:", error);
    return NextResponse.json({ message: "Error adding member", error: error.message }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/members  — Remove a member
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized - Admins only" }, { status: 403 });
    }

    await connectDB();
    const { userId } = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    project.members = project.members.filter((m: any) => m.toString() !== userId);
    await project.save();

    const updated = await Project.findById(id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("DELETE /api/projects/[id]/members error:", error);
    return NextResponse.json({ message: "Error removing member", error: error.message }, { status: 500 });
  }
}
