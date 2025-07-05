"use client";
import { motion } from "framer-motion";

import { Blog } from "@/types/blog";

interface BlogStatsProps {
  blogs: Blog[];
  totalTags: number;
}

export default function BlogStats({ blogs, totalTags }: BlogStatsProps) {
  const postsThisMonth = blogs.filter(blog => {
    const blogDate = new Date(blog.publishedAt);
    const now = new Date();
    return blogDate.getMonth() === now.getMonth() && blogDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 relative">
        Blog Stats
        <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
          <span className="font-semibold text-gray-900 dark:text-white">{blogs.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Categories</span>
          <span className="font-semibold text-gray-900 dark:text-white">{totalTags}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">This Month</span>
          <span className="font-semibold text-gray-900 dark:text-white">{postsThisMonth}</span>
        </div>
      </div>
    </motion.div>
  );
} 