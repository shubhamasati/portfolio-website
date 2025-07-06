import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hank.dev'
  const adminPassword = process.env.ADMIN_PASSWORD || 'HankSecure2024!'
  const adminName = process.env.ADMIN_NAME || 'Hank'
  
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
      aboutMe: process.env.PROFILE_ABOUT_ME || "I love building scalable applications and sharing knowledge through writing and open-source contributions.",
      avatar: process.env.PROFILE_AVATAR || "",
      availabilityStatus: process.env.PROFILE_AVAILABILITY_STATUS || "available",
      website: process.env.PROFILE_WEBSITE || ""
    },
  })

  // Create sample experience
  const experience = await prisma.experience.create({
    data: {
      profileId: profile.id,
      company: "Tech Company",
      title: "Senior Full Stack Developer",
      startDate: new Date("2022-01-01"),
      endDate: null, // Current position
      description: "Leading development of modern web applications using React, Next.js, and Node.js.",
      order: 0
    },
  })

  // Create sample education
  const education = await prisma.education.create({
    data: {
      profileId: profile.id,
      school: "University of Technology",
      degree: "Bachelor of Computer Science",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2022-05-01"),
      description: "Focused on software engineering and web development.",
      order: 0
    },
  })

  console.log({ adminUser, profile, experience, education })
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