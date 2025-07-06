const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function checkProfile() {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: true
      }
    });
    
    console.log('All profiles in database:');
    profiles.forEach(profile => {
      console.log({
        id: profile.id,
        userId: profile.userId,
        userName: profile.user.name,
        userEmail: profile.user.email,
        availabilityStatus: profile.availabilityStatus,
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfile(); 