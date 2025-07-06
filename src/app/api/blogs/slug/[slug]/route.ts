import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await prisma.blog.findFirst({
      where: { 
        slug: slug,
        published: true 
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        tags: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        views: true,
        claps: true,
        category: true,
        coverImage: true,
        readTime: true,
        showViews: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 