const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('Checking for admin user...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (user) {
      console.log('✅ Admin user found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } else {
      console.log('❌ Admin user not found');
    }
    // Always print all users
    const allUsers = await prisma.user.findMany();
    console.log('All users in database:', allUsers);
    // Check if there are any blogs
    const blogs = await prisma.blog.findMany();
    console.log(`Number of blogs: ${blogs.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser(); 