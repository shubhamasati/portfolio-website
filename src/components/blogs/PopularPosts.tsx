"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { Blog } from "@/types/blog";

interface PopularPostsProps {
  posts: Blog[];
}

export default function PopularPosts({ posts }: PopularPostsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 relative">
        Popular Posts
        <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <Link
              href={`/blogs/${post.slug}`}
              className="block group hover:-translate-x-1 transition-all duration-300"
            >
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2 line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {post.excerpt || post.title}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
} 