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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        profile: {
          include: {
            socialMedia: {
              orderBy: { order: 'asc' }
            }
          }
        } 
      },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(user.profile.socialMedia);
  } catch (error) {
    console.error("Error fetching social media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { platform, url, username, icon, order } = body;

    if (!platform || !url) {
      return NextResponse.json({ error: "Platform and URL are required" }, { status: 400 });
    }

    const socialMedia = await prisma.socialMedia.create({
      data: {
        profileId: user.profile.id,
        platform,
        url,
        username,
        icon,
        order: order || 0,
      },
    });

    return NextResponse.json(socialMedia);
  } catch (error) {
    console.error("Error creating social media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 