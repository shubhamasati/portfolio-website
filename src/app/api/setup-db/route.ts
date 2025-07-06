import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log("🚀 Setting up production database...");

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "admin@hank.dev";
    const adminPassword = process.env.ADMIN_PASSWORD || "HankSecure2024!";
    const adminName = process.env.ADMIN_NAME || "Hank";

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
      data: { adminUser, profile, experience, education }
    });

  } catch (error) {
    console.error("❌ Error setting up database:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to setup database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 