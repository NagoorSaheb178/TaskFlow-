export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import mongoose from "mongoose";

// Ensure models are registered (prevents tree-shaking)
const _User = User;

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

    // ── Auto-fix: migrate old projects with no members — add the creator ──
    const emptyMemberProjects = await Project.find({ $or: [{ members: { $size: 0 } }, { members: { $exists: false } }] });
    for (const proj of emptyMemberProjects) {
      if (proj.createdBy) {
        proj.members = [proj.createdBy];
        await proj.save();
      }
    }

    // Admin sees all projects, Member sees only projects they are a member of
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query = role === "Admin" ? { createdBy: userObjectId } : { members: userObjectId };

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ message: "Error fetching projects", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized - Admins only" }, { status: 403 });
    }

    await connectDB();
    const { name, description } = await req.json();
    const userId = (session.user as any).id;

    if (!name?.trim()) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const newProject = await Project.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userObjectId,
      members: [userObjectId], // Creator is always the first member
    });

    const populated = await Project.findById(newProject._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ message: "Error creating project", error: error.message }, { status: 500 });
  }
}
