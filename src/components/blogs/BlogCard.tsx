"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
  index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {new Date(blog.publishedAt).toLocaleDateString()}
          </span>
          {blog.tags && (
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-medium">
              {blog.tags.split(',')[0].trim()}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
          {blog.excerpt || blog.title}
        </p>
        <Link
          href={`/blogs/${blog.slug}`}
          className="inline-flex items-center text-indigo-600 hover:text-purple-600 font-medium text-lg"
        >
          Read More →
        </Link>
      </div>
    </motion.article>
  );
} 