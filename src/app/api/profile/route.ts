import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Profile GET - Session email:", session.user.email);

    // First try to find user by session email (login email)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
      console.log("Profile GET - User not found for session email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile GET - User found:", user.id, user.email);

    // Return profile with user data and projects included
    if (user.profile) {
      const responseData = {
        ...user.profile,
        user: {
          name: user.name,
          email: user.email, // This will be the communication email
        }
      };
      console.log("Profile GET - Returning profile data:", responseData);
      return NextResponse.json(responseData);
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email, // This will be the communication email
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Profile PUT - Session email:", session.user.email);

    // Check if user is admin by querying the database using session email (login email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      console.log("Profile PUT - User not found for session email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile PUT - User found:", user.id, user.email);

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Profile PUT - Request body:", body);
    const {
      bio,
      aboutMe,
      title,
      location,
      avatar,
      availabilityStatus,
      website,
    } = body;

    let profile;
    if (user.profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          bio,
          aboutMe,
          title,
          location,
          avatar,
          availabilityStatus,
          website,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          bio,
          aboutMe,
          title,
          location,
          avatar,
          availabilityStatus,
          website,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 