import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Check if admin user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (!user) {
      return NextResponse.json({
        status: "error",
        message: "Admin user not found",
        user: null
      });
    }

    // Test password hashing
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    return NextResponse.json({
      status: "success",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.password.substring(0, 20) + '...' // Show first 20 chars of hash
      },
      passwordTest: {
        testPassword,
        isPasswordValid,
        hashLength: user.password.length
      }
    });
  } catch (error) {
    console.error("Test user error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 