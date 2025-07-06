import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🔍 Checking database status...");

    // Check if we can connect to the database
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`📊 User count: ${userCount}`);

    // Check if any profiles exist
    const profileCount = await prisma.profile.count();
    console.log(`📊 Profile count: ${profileCount}`);

    // Get the first user if any exists
    const firstUser = await prisma.user.findFirst({
      include: {
        profile: true
      }
    });

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      userCount,
      profileCount,
      firstUser: firstUser ? {
        id: firstUser.id,
        email: firstUser.email,
        name: firstUser.name,
        role: firstUser.role,
        hasProfile: !!firstUser.profile
      } : null,
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasAdminEmail: !!process.env.ADMIN_EMAIL,
        hasAdminPassword: !!process.env.ADMIN_PASSWORD
      }
    });

  } catch (error) {
    console.error("❌ Database check failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
          hasAdminEmail: !!process.env.ADMIN_EMAIL,
          hasAdminPassword: !!process.env.ADMIN_PASSWORD
        }
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 