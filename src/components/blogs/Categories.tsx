"use client";
import { motion } from "framer-motion";

interface CategoriesProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export default function Categories({ tags, selectedTag, onTagSelect }: CategoriesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 relative">
        Categories
        <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedTag === tag
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
} 