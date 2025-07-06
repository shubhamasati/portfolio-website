import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Shubham Asati',
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Shubham Asati',
      role: 'admin',
    },
  })

  // Create profile for admin user
  const profile = await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: "I'm a passionate full-stack developer with 5+ years of experience building modern web applications. I specialize in React, Next.js, Node.js, and cloud technologies. When I'm not coding, you'll find me exploring new technologies, contributing to open source, or sharing knowledge through my blog.",
      title: "Senior Full-Stack Developer",
      location: "San Francisco, CA",
      website: "https://hankhughes.dev",
      github: "https://github.com/hankhughes",
      linkedin: "https://linkedin.com/in/hankhughes",
      twitter: "https://twitter.com/hankhughes",
      skills: "React, Next.js, TypeScript, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, GraphQL",
      experience: JSON.stringify([
        {
          company: "TechCorp Inc.",
          position: "Senior Full-Stack Developer",
          duration: "2022 - Present",
          description: "Leading development of enterprise web applications using React, Node.js, and AWS."
        },
        {
          company: "StartupXYZ",
          position: "Full-Stack Developer",
          duration: "2020 - 2022",
          description: "Built scalable web applications and mentored junior developers."
        },
        {
          company: "Digital Agency",
          position: "Frontend Developer",
          duration: "2019 - 2020",
          description: "Created responsive websites and e-commerce solutions for clients."
        }
      ]),
      education: JSON.stringify([
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of Technology",
          year: "2019",
          description: "Graduated with honors, specialized in software engineering."
        }
      ]),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
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