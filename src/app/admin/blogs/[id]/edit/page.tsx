"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  published: boolean;
  category: string;
  seoTitle: string;
  seoDescription: string;
  coverImage: string;
  featured: boolean;
  scheduledAt: string | null;
  status: string;
}

interface EditBlogProps {
  params: Promise<{ id: string }>;
}

const CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Design",
  "Business",
  "Personal",
  "Tutorial",
  "Review",
  "Opinion"
];

export default function EditBlog({ params }: EditBlogProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "settings">("edit");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
    category: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    featured: false,
    scheduledAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [blogId, setBlogId] = useState<string>("");

  useEffect(() => {
    const initializePage = async () => {
      if (status === "loading") return;
      
      if (!session || session.user?.role !== "admin") {
        router.push("/admin/login");
        return;
      }

      try {
        const { id } = await params;
        setBlogId(id);
        await fetchBlog(id);
      } catch (error) {
        setError("Failed to load blog");
        setLoading(false);
      }
    };

    initializePage();
  }, [session, status, router, params]);

  const fetchBlog = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) {
        throw new Error("Blog not found");
      }
      const blog: Blog = await response.json();
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || "",
        tags: blog.tags || "",
        published: blog.published,
        category: blog.category || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        coverImage: blog.coverImage || "",
        featured: blog.featured || false,
        scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : "",
      });
    } catch (error) {
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update blog");
      }

      router.push("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const PreviewContent = () => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {formData.coverImage && (
          <img 
            src={formData.coverImage} 
            alt={formData.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {formData.title || "Your Blog Title"}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-lg">
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>•</span>
              <span>5 min read</span>
              {formData.category && (
                <>
                  <span>•</span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {formData.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {formData.excerpt && (
          <div className="mb-8">
            <p className="text-xl text-gray-600 italic border-l-4 border-blue-500 pl-4">
              {formData.excerpt}
            </p>
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: (props) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8">{props.children}</h1>
              ),
              h2: (props) => (
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6">{props.children}</h2>
              ),
              h3: (props) => (
                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-5">{props.children}</h3>
              ),
              p: (props) => (
                <p className="text-gray-700 leading-relaxed mb-4">{props.children}</p>
              ),
              ul: (props) => (
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{props.children}</ul>
              ),
              ol: (props) => (
                <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{props.children}</ol>
              ),
              li: (props) => (
                <li className="text-gray-700">{props.children}</li>
              ),
              blockquote: (props) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 bg-gray-50 py-2 rounded-r">
                  {props.children}
                </blockquote>
              ),
              code: (props) => {
                const isInline = !props.className;
                if (isInline) {
                  return (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {props.children}
                    </code>
                  );
                }
                return (
                  <code className={`${props.className} block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto`}>
                    {props.children}
                  </code>
                );
              },
              pre: (props) => (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  {props.children}
                </pre>
              ),
              a: (props) => (
                <a href={props.href} className="text-blue-600 hover:text-blue-800 underline">
                  {props.children}
                </a>
              ),
              strong: (props) => (
                <strong className="font-bold text-gray-900">{props.children}</strong>
              ),
              em: (props) => (
                <em className="italic text-gray-800">{props.children}</em>
              ),
            }}
          >
            {formData.content || "Your blog content will appear here..."}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {formData.tags && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags.split(',').map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Blog
              </h1>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "edit"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "preview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "settings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {activeTab === "edit" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-gray-900 placeholder-gray-500"
                    placeholder="Enter your blog title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Brief description of your post..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900 placeholder-gray-500"
                    placeholder="Write your blog content in Markdown..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => handleInputChange("published", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                    Publish this post
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PreviewContent />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-6"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="SEO optimized title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Meta description for search engines..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => handleInputChange("coverImage", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange("featured", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Feature this post on the homepage
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to publish immediately when saved
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
} 