import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  return await POST();
}

export async function POST() {
  try {
    console.log("🚀 Setting up production database...");
    
    // Check if environment variables are set
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
    }

    // Test database connection
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if tables exist by trying to query them
    try {
      await prisma.user.count();
      console.log("✅ User table exists");
    } catch (tableError) {
      console.error("❌ User table does not exist. You need to run database migration first.");
      throw new Error("Database tables do not exist. Please run the migration endpoint first: /api/migrate-db");
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Hank";

    console.log("👤 Creating admin user...");
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: "admin",
      },
    });

    console.log("📋 Creating profile...");
    // Create profile for admin user
    const profile = await prisma.profile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        bio: process.env.PROFILE_BIO || "I'm a passionate full-stack developer with experience building modern web applications.",
        title: process.env.PROFILE_TITLE || "Full-Stack Developer",
        location: process.env.PROFILE_LOCATION || "Your Location",
        aboutMe: process.env.PROFILE_ABOUT_ME || "I love building scalable applications and sharing knowledge through writing and open-source contributions.",
        avatar: process.env.PROFILE_AVATAR || "",
        availabilityStatus: process.env.PROFILE_AVAILABILITY_STATUS || "available",
        website: process.env.PROFILE_WEBSITE || ""
      },
    });

    console.log("💼 Creating sample experience...");
    // Create sample experience
    const experience = await prisma.experience.create({
      data: {
        profileId: profile.id,
        company: "Tech Company",
        title: "Senior Full Stack Developer",
        startDate: new Date("2022-01-01"),
        endDate: null, // Current position
        description: "Leading development of modern web applications using React, Next.js, and Node.js.",
        order: 0
      },
    });

    console.log("🎓 Creating sample education...");
    // Create sample education
    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        school: "University of Technology",
        degree: "Bachelor of Computer Science",
        startDate: new Date("2018-09-01"),
        endDate: new Date("2022-05-01"),
        description: "Focused on software engineering and web development.",
        order: 0
      },
    });

    console.log("✅ Database setup complete!");

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
      data: { 
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }, 
        profile: {
          id: profile.id,
          bio: profile.bio,
          title: profile.title,
          location: profile.location
        }, 
        experience, 
        education 
      }
    });

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Database setup failed",
        details: errorMessage,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
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