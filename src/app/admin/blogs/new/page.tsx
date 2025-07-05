"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function NewBlog() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    router.push("/admin/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create blog");
      }

      router.push("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const PreviewContent = () => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
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
              {formData.tags && (
                <>
                  <span>•</span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {formData.tags.split(',')[0]?.trim() || 'Tag'}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Blog
              </h1>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "edit"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "preview"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Preview
                </button>
              </nav>
            </div>
          </div>

          {activeTab === "edit" ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="A brief summary of your blog post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="Write your blog content here... (Markdown supported)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="web-development, react, nextjs (comma-separated)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Creating..." : "Create Blog"}
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <PreviewContent />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
} 