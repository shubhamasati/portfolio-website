"use client";
import { motion } from "framer-motion";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  allTags: string[];
}

export default function SearchAndFilter({ 
  searchTerm, 
  onSearchChange, 
  selectedTag, 
  onTagSelect, 
  allTags 
}: SearchAndFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-2xl mx-auto mb-6"
    >
              <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
          />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
      <div className="flex flex-wrap gap-1.5 justify-center">
        <button
          onClick={() => onTagSelect("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
            selectedTag === ""
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              selectedTag === tag
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
} 