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
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 relative">
        Popular Posts
        <div className="absolute bottom-0 left-0 w-10 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <div className="space-y-2">
        {posts.map((post, index) => (
          <div key={post.id} className="pb-2 border-b border-gray-100 last:border-b-0">
            <Link
              href={`/blogs/${post.slug}`}
              className="block group hover:-translate-x-1 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex-shrink-0 mt-1">
                  {index + 1}
                </span>
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2 leading-tight text-sm">
                  {post.title}
                </h4>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
} 