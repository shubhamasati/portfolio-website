"use client";
import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import BlogHeader from "@/components/blogs/BlogHeader";
import SearchAndFilter from "@/components/blogs/SearchAndFilter";
import BlogCard from "@/components/blogs/BlogCard";
import LoadingSkeleton from "@/components/blogs/LoadingSkeleton";
import EmptyState from "@/components/blogs/EmptyState";
import Pagination from "@/components/blogs/Pagination";
import PopularPosts from "@/components/blogs/PopularPosts";
import Categories from "@/components/blogs/Categories";
import NewsletterSubscribe from "@/components/blogs/NewsletterSubscribe";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const blogsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const allBlogs = await response.json();
      const publishedBlogs = allBlogs.filter((blog: Blog) => blog.published);
      setBlogs(publishedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(
      blogs
        .flatMap((blog) => blog.tags?.split(",").map((tag) => tag.trim()) || [])
        .filter(Boolean)
    )
  );

  // Filter blogs based on search and tag
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Get popular posts (most recent 5)
  const popularPosts = blogs.slice(0, 5);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <BlogHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          allTags={allTags}
        />
      </div>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blog Posts - 2/3 width */}
            <div className="lg:col-span-2">
              {loading ? (
                <LoadingSkeleton />
              ) : currentBlogs.length > 0 ? (
                <>
                  <div className="space-y-8">
                    {currentBlogs.map((blog, index) => (
                      <BlogCard key={blog.id} blog={blog} index={index} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <EmptyState
                  searchTerm={searchTerm}
                  selectedTag={selectedTag}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                <PopularPosts posts={popularPosts} />
                <Categories
                  tags={allTags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
                <NewsletterSubscribe />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 