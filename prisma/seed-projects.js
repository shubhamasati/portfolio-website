const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  // Find the first user with a profile
  const user = await prisma.user.findFirst({
    include: { profile: true },
  });

  if (!user || !user.profile) {
    console.log('No user with profile found. Please run the main seed script first.');
    return;
  }

  // Sample projects
  const projects = [
    {
      title: "Task Management App",
      description: "A full-stack productivity application with real-time collaboration, drag-and-drop functionality, and smart notifications.",
      technologies: "React, Node.js, MongoDB, Socket.io",
      imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
      liveUrl: "https://task-app-demo.com",
      githubUrl: "https://github.com/username/task-app",
      featured: true,
      order: 1,
    },
    {
      title: "E-commerce Platform",
      description: "Modern e-commerce solution with advanced search, payment integration, and comprehensive admin dashboard.",
      technologies: "Next.js, PostgreSQL, Stripe, AWS",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      liveUrl: "https://ecommerce-demo.com",
      githubUrl: "https://github.com/username/ecommerce",
      featured: true,
      order: 2,
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time analytics dashboard with interactive charts, data visualization, and customizable reporting features.",
      technologies: "Vue.js, D3.js, Python, Redis",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      liveUrl: "https://analytics-demo.com",
      githubUrl: "https://github.com/username/analytics",
      featured: true,
      order: 3,
    },
  ];

  // Create projects
  for (const project of projects) {
    await prisma.project.create({
      data: {
        ...project,
        profileId: user.profile.id,
      },
    });
  }

  console.log('Sample projects created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 