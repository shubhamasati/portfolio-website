"use client";
import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8">
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
  );
} 