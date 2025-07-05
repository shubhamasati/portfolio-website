"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const blogsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const allBlogs = await response.json();
      const publishedBlogs = allBlogs.filter((blog: Blog) => blog.published);
      setBlogs(publishedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(
      blogs
        .flatMap((blog) => blog.tags?.split(",").map((tag) => tag.trim()) || [])
        .filter(Boolean)
    )
  );

  // Filter blogs based on search and tag
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hank Huge
            </Link>
            <ul className="flex space-x-8">
              <li><Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Home</Link></li>
              <li><Link href="/#about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">About</Link></li>
              <li><Link href="/#projects" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Projects</Link></li>
              <li><Link href="/blogs" className="text-indigo-600 dark:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Blog</Link></li>
              <li><Link href="/#skills" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Skills</Link></li>
              <li><Link href="/#contact" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 hover:-translate-y-0.5">Contact</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              My <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Exploring web development, sharing tutorials, and discussing the latest tech trends
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedTag("")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTag === ""
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTag === tag
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : currentBlogs.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentBlogs.map((blog, index) => (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center items-center space-x-2 mt-12"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === totalPages
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                    }`}
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedTag
                  ? "Try adjusting your search or filter criteria"
                  : "Check back soon for new content!"}
              </p>
              {(searchTerm || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTag("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
} 