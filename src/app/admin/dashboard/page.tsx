"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import BlogAnalytics from "@/components/BlogAnalytics";

interface Blog {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  claps: number;
  category: string | null;
  featured: boolean;
  status: string;
  excerpt: string | null;
  tags: string | null;
  readTime: number | null;
  coverImage: string | null;
  showViews: boolean;
}

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalViews: number;
  totalClaps: number;
  featuredBlogs: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalClaps: 0,
    featuredBlogs: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Bulk operations
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchBlogs();
  }, [session, status, router]);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Expected blogs array, got:", data);
        setBlogs([]);
        calculateStats([]);
        return;
      }
      
      setBlogs(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (blogData: Blog[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    setStats({
      totalBlogs: blogData.length,
      publishedBlogs: blogData.filter(b => b.published).length,
      draftBlogs: blogData.filter(b => !b.published).length,
      totalViews: blogData.filter(b => b.published).reduce((sum, b) => sum + b.views, 0),
      totalClaps: blogData.filter(b => b.published).reduce((sum, b) => sum + b.claps, 0),
      featuredBlogs: blogData.filter(b => b.featured).length,
    });
  };

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(blog => {
        if (statusFilter === "published") return blog.published;
        if (statusFilter === "drafts") return !blog.published;
        if (statusFilter === "featured") return blog.featured;
        return true;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Blog];
      let bValue: any = b[sortBy as keyof Blog];

      if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "publishedAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBlogs(filtered);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBlogs.length === 0) return;

    try {
      const promises = selectedBlogs.map(blogId =>
        fetch(`/api/blogs/${blogId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            published: action === "publish" ? true : action === "unpublish" ? false : undefined,
            featured: action === "feature" ? true : action === "unfeature" ? false : undefined,
            status: action === "archive" ? "archived" : undefined
          }),
        })
      );

      await Promise.all(promises);
      setSelectedBlogs([]);
      setSelectAll(false);
      fetchBlogs();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBlogs([]);
      setSelectAll(false);
    } else {
      setSelectedBlogs(filteredBlogs.map(blog => blog.id));
      setSelectAll(true);
    }
  };

  const handleSelectBlog = (blogId: string) => {
    setSelectedBlogs(prev => 
      prev.includes(blogId) 
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );
  };

  const handlePublish = async (blogId: string, published: boolean) => {
    try {
      await fetch(`/api/blogs/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const getCategories = () => {
    const categories = blogs
      .map(blog => blog.category)
      .filter((category): category is string => category !== null);
    return [...new Set(categories)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Blog Management Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/blogs/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + New Post
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "posts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Posts
            </button>
            <Link
              href="/admin/profile"
              className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BlogAnalytics />
          </motion.div>
        )}

        {activeTab === "posts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="Search blogs..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="drafts">Drafts</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {getCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                    <option value="views-desc">Most Views</option>
                    <option value="claps-desc">Most Claps</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Views Visibility Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Blog Display Settings</h3>
                  <p className="text-sm text-gray-600">Control what's visible on your blog posts</p>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBlogs.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedBlogs.length} post(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction("publish")}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleBulkAction("unpublish")}
                      className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Unpublish
                    </button>
                    <button
                      onClick={() => handleBulkAction("feature")}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Feature
                    </button>
                    <button
                      onClick={() => handleBulkAction("archive")}
                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Views
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Show Views
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Created
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBlogs.map((blog) => (
                      <motion.tr
                        key={blog.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBlogs.includes(blog.id)}
                            onChange={() => handleSelectBlog(blog.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-3">
                            {blog.coverImage && (
                              <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {blog.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {blog.excerpt?.substring(0, 40)}...
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {blog.featured && (
                                  <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                    Featured
                                  </span>
                                )}
                                <span
                                  className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                    blog.published
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {blog.published ? "Published" : "Draft"}
                                </span>
                                {blog.readTime && (
                                  <span className="text-xs text-gray-400">
                                    {blog.readTime}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              blog.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                          {blog.category || "—"}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                          {blog.views.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                          <button
                            onClick={async () => {
                              await fetch(`/api/blogs/${blog.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ showViews: !blog.showViews }),
                              });
                              fetchBlogs();
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blog.showViews ? 'bg-indigo-600' : 'bg-gray-200'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${blog.showViews ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handlePublish(blog.id, !blog.published)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                blog.published
                                  ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                            >
                              {blog.published ? "Unpub" : "Pub"}
                            </button>
                            <Link
                              href={`/admin/blogs/${blog.id}/edit`}
                              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 