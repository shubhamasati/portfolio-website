import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Admin User'
  
  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
    },
  })

  // Create profile for admin user
  const profile = await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: process.env.PROFILE_BIO || "I'm a passionate full-stack developer with experience building modern web applications.",
      title: process.env.PROFILE_TITLE || "Full-Stack Developer",
      location: process.env.PROFILE_LOCATION || "Your Location",
      website: process.env.PROFILE_WEBSITE || "",
      github: process.env.PROFILE_GITHUB || "",
      linkedin: process.env.PROFILE_LINKEDIN || "",
      twitter: process.env.PROFILE_TWITTER || "",
      skills: process.env.PROFILE_SKILLS || "React, Next.js, TypeScript, Node.js",
      experience: process.env.PROFILE_EXPERIENCE || JSON.stringify([]),
      education: process.env.PROFILE_EDUCATION || JSON.stringify([]),
      avatar: process.env.PROFILE_AVATAR || ""
    },
  })

  console.log({ adminUser, profile })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 