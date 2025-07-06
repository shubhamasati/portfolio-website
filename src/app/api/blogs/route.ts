import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Function to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists and generate a unique one
  while (true) {
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });
    
    if (!existingBlog) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let session = null;
  let body = null;
  try {
    session = await getServerSession(authOptions);
    body = await request.json();
    console.error('DEBUG: session:', session);
    console.error('DEBUG: request body:', body);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { 
      title, 
      content, 
      excerpt, 
      tags, 
      published, 
      category, 
      seoTitle, 
      seoDescription, 
      coverImage, 
      featured,
      scheduledAt,
      showViews
    } = body;
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    // Generate unique slug from title
    const slug = await generateUniqueSlug(title);
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    console.error('DEBUG: looked up user:', user);
    if (!user) {
      return NextResponse.json(
        { error: "User not found", sessionUser: session.user },
        { status: 404 }
      );
    }
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        tags,
        published: published || false,
        authorId: user.id,
        publishedAt: published ? new Date() : null,
        category,
        seoTitle,
        seoDescription,
        coverImage,
        featured: featured || false,
        readTime,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: published ? "published" : "draft",
        lastEditedAt: new Date(),
        showViews: showViews !== undefined ? showViews : true,
      },
    });
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("ERROR in blog creation:", error);
    console.error("DEBUG: session at error:", session);
    console.error("DEBUG: body at error:", body);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to create blog", details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 