const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

const skillDomains = [
  {
    domain: "Backend Development",
    expertise: "Expert",
    technologies: JSON.stringify(["Spring Boot", "Node.js", "Python", "Express.js", "Java", "Go", "GraphQL", "REST APIs", "Microservices", "Docker"]),
    icon: "🔧",
    order: 1
  },
  {
    domain: "Frontend Development",
    expertise: "Advanced",
    technologies: JSON.stringify(["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "HTML/CSS", "JavaScript", "Redux", "Framer Motion"]),
    icon: "⚛️",
    order: 2
  },
  {
    domain: "DevOps & Cloud",
    expertise: "Advanced",
    technologies: JSON.stringify(["Docker", "Kubernetes", "AWS", "Jenkins", "CI/CD", "Terraform", "Ansible", "Azure", "GitHub Actions"]),
    icon: "☁️",
    order: 3
  },
  {
    domain: "Database & Storage",
    expertise: "Intermediate",
    technologies: JSON.stringify(["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch", "SQL", "NoSQL", "Data Modeling"]),
    icon: "🗄️",
    order: 4
  },
  {
    domain: "Development Tools",
    expertise: "Advanced",
    technologies: JSON.stringify(["Git", "VS Code", "Postman", "Jira", "Figma", "Docker", "Webpack", "ESLint", "Prettier"]),
    icon: "🛠️",
    order: 5
  },
  {
    domain: "APIs & Integration",
    expertise: "Expert",
    technologies: JSON.stringify(["REST APIs", "GraphQL", "WebSockets", "OAuth 2.0", "JWT", "Microservices", "API Gateway", "Swagger", "OpenAPI"]),
    icon: "🔌",
    order: 6
  }
];

async function seedSkillDomains() {
  try {
    console.log('Seeding skill domains...');
    
    // First, clear existing skill domains
    await prisma.skillDomain.deleteMany();
    console.log('✓ Cleared existing skill domains');
    
    for (const domain of skillDomains) {
      await prisma.skillDomain.create({
        data: domain
      });
      console.log(`✓ Seeded: ${domain.domain}`);
    }
    
    console.log('Skill domains seeded successfully!');
  } catch (error) {
    console.error('Error seeding skill domains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSkillDomains(); 