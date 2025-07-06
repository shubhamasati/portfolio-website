import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clapCount = 1 } = body; // Default to 1 clap, but allow multiple
    
    // Validate clap count (1-50 claps per request)
    const validClapCount = Math.min(Math.max(clapCount, 1), 50);
    
    // Increment the clap count
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        claps: {
          increment: validClapCount
        }
      },
      select: {
        id: true,
        claps: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      claps: updatedBlog.claps,
      clapsAdded: validClapCount
    });
  } catch (error) {
    console.error("Error adding claps:", error);
    return NextResponse.json(
      { error: "Failed to add claps" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current clap count
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        claps: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      claps: blog?.claps || 0
    });
  } catch (error) {
    console.error("Error getting clap count:", error);
    return NextResponse.json(
      { error: "Failed to get clap count" },
      { status: 500 }
    );
  }
} 