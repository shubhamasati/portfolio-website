import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  return await POST();
}

export async function POST() {
  try {
    console.log("🚀 Starting database migration...");

    // Check if environment variables are set
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("📋 Pushing schema to database...");
    
    // Run prisma db push to create tables
    const pushResult = execSync('npx prisma db push', {
      stdio: 'pipe',
      encoding: 'utf8',
      env: process.env
    });

    console.log("✅ Schema pushed successfully!");
    console.log("Push result:", pushResult);

    // Generate Prisma client
    console.log("🔧 Generating Prisma client...");
    const generateResult = execSync('npx prisma generate', {
      stdio: 'pipe',
      encoding: 'utf8',
      env: process.env
    });

    console.log("✅ Prisma client generated!");
    console.log("Generate result:", generateResult);

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully!",
      pushResult: pushResult,
      generateResult: generateResult
    });

  } catch (error) {
    console.error("❌ Database migration failed:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorOutput = error instanceof Error && 'stdout' in error ? 
      (error as any).stdout?.toString() || (error as any).stderr?.toString() : '';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Database migration failed",
        details: errorMessage,
        output: errorOutput,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrl: process.env.DATABASE_URL ? 
            process.env.DATABASE_URL.substring(0, 20) + "..." : 
            "Not set"
        }
      },
      { status: 500 }
    );
  }
} 