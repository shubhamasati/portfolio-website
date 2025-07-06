import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Find the admin user (assuming there's only one admin user)
    const user = await prisma.user.findFirst({
      where: { role: "admin" },
      include: { 
        profile: {
          include: {
            projects: {
              orderBy: { order: 'asc' }
            },
            socialMedia: {
              orderBy: { order: 'asc' }
            },
            experiences: {
              orderBy: { order: 'asc' }
            },
            educations: {
              orderBy: { order: 'asc' }
            }
          }
        } 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No admin user found" }, { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return profile with user data and related data included
    const responseData = {
      ...user.profile,
      user: {
        name: user.name,
        email: user.email,
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 