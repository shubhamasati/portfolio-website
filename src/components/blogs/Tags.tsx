"use client";
import { motion } from "framer-motion";

interface TagsProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export default function Tags({ tags, selectedTag, onTagSelect }: TagsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 relative">
        Tags
        <div className="absolute bottom-0 left-0 w-10 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedTag === tag
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
} 