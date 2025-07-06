import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    
    // Try to get blog count
    const blogCount = await prisma.blog.count();
    
    // Try to get user count
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: "connected",
      tables: tableCount,
      blogCount,
      userCount,
      message: "Database connection successful"
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 