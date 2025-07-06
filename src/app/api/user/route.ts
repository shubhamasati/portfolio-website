import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User PUT - Session email:", session.user.email);

    // Find the current user by their current email (from session)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role !== "admin") {
      console.log("User PUT - User not found or not admin:", session.user.email);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User PUT - Current user found:", currentUser.id, currentUser.email);

    const body = await request.json();
    const { name, email } = body;

    console.log("User PUT - Update request:", { name, email, currentEmail: currentUser.email });

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate email if provided
    if (email && typeof email !== "string") {
      return NextResponse.json({ error: "Email must be a string" }, { status: 400 });
    }

    // Check if email is already taken by another user (only if email is changing)
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        console.log("User PUT - Email already taken:", email);
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
    }

    const updateData: any = { name };
    if (email) {
      updateData.email = email;
    }

    console.log("User PUT - Updating with data:", updateData);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    console.log("User PUT - Update successful:", updatedUser.id, updatedUser.email);

    // Return the updated user data but note that the session email remains the same for login
    return NextResponse.json({ 
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      message: "User updated successfully. Note: Login email remains unchanged for security."
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 