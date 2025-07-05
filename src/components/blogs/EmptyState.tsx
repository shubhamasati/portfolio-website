"use client";
import { motion } from "framer-motion";

interface EmptyStateProps {
  searchTerm: string;
  selectedTag: string;
  onClearFilters: () => void;
}

export default function EmptyState({ searchTerm, selectedTag, onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No articles found
      </h3>
      <p className="text-gray-600 mb-6">
        {searchTerm || selectedTag
          ? "Try adjusting your search or filter criteria"
          : "Check back soon for new content!"}
      </p>
      {(searchTerm || selectedTag) && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Clear Filters
        </button>
      )}
    </motion.div>
  );
} 