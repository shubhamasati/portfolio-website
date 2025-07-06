const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function testBlogCreation() {
  try {
    console.log('Testing blog creation...');
    
    // First, get the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!user) {
      console.error('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', user.email);
    
    // Try to create a test blog
    const testBlog = await prisma.blog.create({
      data: {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is a test blog post content.',
        excerpt: 'A test blog post for debugging.',
        published: false,
        authorId: user.id,
        category: 'Test',
        readTime: 1,
        status: 'draft',
        lastEditedAt: new Date(),
        showViews: true,
      },
    });
    
    console.log('✅ Blog created successfully:', {
      id: testBlog.id,
      title: testBlog.title,
      slug: testBlog.slug,
      authorId: testBlog.authorId
    });
    
    // Clean up - delete the test blog
    await prisma.blog.delete({
      where: { id: testBlog.id }
    });
    
    console.log('✅ Test blog deleted');
    
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBlogCreation(); 