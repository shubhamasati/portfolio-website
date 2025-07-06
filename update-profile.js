const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function updateProfile() {
  try {
    const updatedProfile = await prisma.profile.update({
      where: { id: 'cmcqqyei10002zxwgrzi105wn' },
      data: {
        availabilityStatus: 'available'
      }
    });
    
    console.log('Profile updated successfully:');
    console.log({
      id: updatedProfile.id,
      availabilityStatus: updatedProfile.availabilityStatus
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProfile(); 