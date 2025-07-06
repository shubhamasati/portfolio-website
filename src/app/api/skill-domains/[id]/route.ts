import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET single skill domain
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const skillDomain = await prisma.skillDomain.findUnique({
      where: { id: params.id }
    });

    if (!skillDomain) {
      return NextResponse.json(
        { error: 'Skill domain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(skillDomain);
  } catch (error) {
    console.error('Error fetching skill domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill domain' },
      { status: 500 }
    );
  }
}

// PUT update skill domain
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { domain, expertise, technologies, icon, order } = body;

    const skillDomain = await prisma.skillDomain.update({
      where: { id: params.id },
      data: {
        domain,
        expertise,
        technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : technologies,
        icon,
        order
      }
    });

    return NextResponse.json(skillDomain);
  } catch (error) {
    console.error('Error updating skill domain:', error);
    return NextResponse.json(
      { error: 'Failed to update skill domain' },
      { status: 500 }
    );
  }
}

// DELETE skill domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.skillDomain.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Skill domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill domain' },
      { status: 500 }
    );
  }
} 