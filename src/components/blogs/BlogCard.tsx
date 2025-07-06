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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        {/* Tag and Date Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            {blog.tags && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {blog.tags.split(',')[0].trim()}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 ml-4">
            {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
          {blog.excerpt || blog.title}
        </p>

        {/* Footer with engagement and action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center space-x-3">
            {/* Claps */}
            <div className="flex items-center space-x-1 text-gray-500">
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-xs font-medium text-blue-600">{blog.claps || 0}</span>
            </div>
            
            {/* Reading time */}
            <div className="flex items-center space-x-1 text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">5 min</span>
            </div>
          </div>

          {/* Read More */}
          <Link
            href={`/blogs/${blog.slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors duration-300"
          >
            Read →
          </Link>
        </div>
      </div>
    </motion.article>
  );
} 