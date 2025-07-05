"use client";
import { motion } from "framer-motion";

export default function NewsletterSubscribe() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 relative">
        Stay Updated
        <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Get the latest posts delivered straight to your inbox.
      </p>
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Your email address"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
        />
        <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
          Subscribe
        </button>
      </div>
    </motion.div>
  );
} 