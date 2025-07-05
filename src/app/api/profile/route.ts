import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse JSON strings back to objects
    const profileWithParsedData = {
      ...profile,
      experience: profile.experience ? JSON.parse(profile.experience) : [],
      education: profile.education ? JSON.parse(profile.education) : [],
      skills: profile.skills ? profile.skills.split(',').map(skill => skill.trim()) : [],
    };

    return NextResponse.json(profileWithParsedData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 