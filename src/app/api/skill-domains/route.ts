import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET all skill domains
export async function GET() {
  try {
    const skillDomains = await prisma.skillDomain.findMany({
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(skillDomains);
  } catch (error) {
    console.error('Error fetching skill domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill domains' },
      { status: 500 }
    );
  }
}

// POST new skill domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, expertise, technologies, icon, order } = body;

    if (!domain || !technologies) {
      return NextResponse.json(
        { error: 'Domain and technologies are required' },
        { status: 400 }
      );
    }

    const skillDomain = await prisma.skillDomain.create({
      data: {
        domain,
        expertise: expertise || 'Advanced',
        technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : technologies,
        icon,
        order: order || 0
      }
    });

    return NextResponse.json(skillDomain);
  } catch (error) {
    console.error('Error creating skill domain:', error);
    return NextResponse.json(
      { error: 'Failed to create skill domain' },
      { status: 500 }
    );
  }
} 