"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  published: boolean;
  tags: string;
}

interface Profile {
  id: string;
  bio: string;
  title: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    description: string;
  }>;
  avatar: string;
  user: {
    name: string;
    email: string;
  };
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsResponse, profileResponse] = await Promise.all([
        fetch("/api/blogs"),
        fetch("/api/profile")
      ]);

      const allBlogs = await blogsResponse.json();
      const publishedBlogs = allBlogs.filter((blog: Blog) => blog.published);
      setBlogs(publishedBlogs.slice(0, 3)); // Show latest 3 published blogs

      const profileData = await profileResponse.json();
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {profile?.user.name || "Hank Huge"}
            </div>
            <ul className="flex space-x-8">
              <li><a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Home</a></li>
              <li><a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">About</a></li>
              <li><a href="#projects" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Projects</a></li>
              <li><a href="#blog" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Blog</a></li>
              <li><a href="#skills" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Skills</a></li>
              <li><a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Contact</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero Section - Keeping current design */}
      <section id="home" className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 overflow-hidden pt-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {profile?.user.name || "Hank"}
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                {profile?.title || "Full-Stack Developer"}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {profile?.bio || "Passionate developer building modern web applications and sharing knowledge through writing."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/blogs"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Explore My Blogs
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  Get In Touch
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                    <Image
                      src={profile?.avatar || "/placeholder-avatar.jpg"}
                      alt={profile?.user.name || "Profile"}
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  Available
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - Keeping current design */}
      <section id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {profile?.bio || "I'm a passionate developer who loves building amazing web experiences and sharing knowledge with the community."}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Experience</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {profile?.experience?.length || 0} years of professional experience in web development
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Always exploring new technologies and best practices
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Writing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sharing knowledge through blog posts and tutorials
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section - From mockup */}
      <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A selection of my recent work showcasing different technologies and problem-solving approaches
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Task Management App",
                description: "A full-stack productivity application with real-time collaboration, drag-and-drop functionality, and smart notifications.",
                tech: ["React", "Node.js", "MongoDB", "Socket.io"],
                emoji: "📱"
              },
              {
                title: "E-commerce Platform",
                description: "Modern e-commerce solution with advanced search, payment integration, and comprehensive admin dashboard.",
                tech: ["Next.js", "PostgreSQL", "Stripe", "AWS"],
                emoji: "🛒"
              },
              {
                title: "Analytics Dashboard",
                description: "Real-time analytics dashboard with interactive charts, data visualization, and customizable reporting features.",
                tech: ["Vue.js", "D3.js", "Python", "Redis"],
                emoji: "📊"
              }
            ].map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {project.emoji}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium text-sm">
                      Live Demo
                    </a>
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium text-sm">
                      View Code
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section - From mockup */}
      <section id="skills" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Technical <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Skills</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Technologies and tools I use to bring ideas to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Frontend", icon: "⚛️", skills: "React, Vue.js, TypeScript\nModern CSS, Tailwind\nWebpack, Vite" },
              { title: "Backend", icon: "🔧", skills: "Node.js, Python, Express\nPostgreSQL, MongoDB\nGraphQL, REST APIs" },
              { title: "DevOps", icon: "☁️", skills: "AWS, Docker, Kubernetes\nCI/CD, GitHub Actions\nNginx, Linux" },
              { title: "Writing", icon: "📝", skills: "Technical Documentation\nTutorial Creation\nContent Strategy" }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 text-center transition-all duration-300 hover:shadow-lg border border-indigo-100 dark:border-indigo-800"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {category.title}
                </h3>
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {category.skills}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section - Enhanced from mockup */}
      <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Latest from My <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Blog</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Exploring web development, sharing tutorials, and discussing the latest tech trends
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse border border-gray-200 dark:border-gray-700"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </motion.div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {blog.title.charAt(0)}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </span>
                      {blog.tags && (
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-medium">
                          {blog.tags.split(',')[0].trim()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.excerpt || blog.title}
                    </p>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-400"
            >
              <p className="text-lg mb-2">No published blogs yet.</p>
              <p className="text-sm">Check back soon for new content!</p>
            </motion.div>
          )}

          {blogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Link
                href="/blogs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                View All Articles
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Let's Connect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              I'm always interested in new opportunities and collaborations
            </p>
          </motion.div>

          <div className="flex justify-center space-x-8">
            {profile?.github && (
              <motion.a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </motion.a>
            )}
            {profile?.linkedin && (
              <motion.a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>
            )}
            {profile?.twitter && (
              <motion.a
                href={profile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </motion.a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
