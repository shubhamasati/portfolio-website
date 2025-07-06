"use client";
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  views: number;
  claps: number;
  category: string | null;
  coverImage: string | null;
  readTime: number | null;
  showViews: boolean;
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [clapLoading, setClapLoading] = useState(false);
  const [userClaps, setUserClaps] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { slug } = await params;
        const response = await fetch(`/api/blogs/slug/${slug}`);
        
        if (!response.ok) {
          setError(true);
          return;
        }
        
        const blogData = await response.json();
        setBlog(blogData);
        setClapCount(blogData.claps || 0);

        // Track view
        await fetch(`/api/blogs/${blogData.id}/view`, {
          method: 'POST'
        });
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

  const handleClap = async () => {
    if (!blog || clapLoading) return;

    setClapLoading(true);
    try {
      const response = await fetch(`/api/blogs/${blog.id}/clap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clapCount: 1 })
      });

      if (response.ok) {
        const data = await response.json();
        setClapCount(data.claps);
        setUserClaps(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding clap:', error);
    } finally {
      setClapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a
            href="/blogs"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Articles
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Simple Floating Engagement Sidebar */}
        <div className="fixed left-[calc(50%+28rem+8px)] top-1/2 transform -translate-y-1/2 z-10 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-full shadow-lg border border-gray-200 p-1.5 space-y-1.5"
          >
            {/* Clap Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9, y: 0 }}
                onClick={handleClap}
                disabled={clapLoading}
                className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.button>
              <div className="mt-1 text-xs font-semibold text-blue-600">{clapCount}</div>
            </div>

            {/* Views (Admin controlled) */}
            {blog.showViews && (
              <div className="text-center pt-1.5 border-t border-gray-100">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-xs font-medium text-gray-700">{blog.views}</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile Engagement Bar */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClap}
                  disabled={clapLoading}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{clapLoading ? '...' : 'Like'}</span>
                </motion.button>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">{clapCount}</span> likes
                </div>
              </div>
              {blog.showViews && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm">{blog.views}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="relative h-64 md:h-80">
              <img 
                src={blog.coverImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          )}

          {/* Article Header */}
          <header className="p-8 border-b border-gray-200">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span>{blog.readTime || 5} min read</span>
              {blog.category && (
                <>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {blog.category}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                {blog.excerpt}
              </p>
            )}
          </header>

          {/* Article Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none prose-gray">
              <ReactMarkdown
                components={{
                  h1: (props) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-8 border-b border-gray-200 pb-2">{props.children}</h1>
                  ),
                  h2: (props) => (
                    <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6 border-b border-gray-100 pb-1">{props.children}</h2>
                  ),
                  h3: (props) => (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{props.children}</h3>
                  ),
                  p: (props) => (
                    <p className="text-gray-700 leading-relaxed mb-4 text-base">{props.children}</p>
                  ),
                  ul: (props) => (
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1 text-base">{props.children}</ul>
                  ),
                  ol: (props) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1 text-base">{props.children}</ol>
                  ),
                  li: (props) => (
                    <li className="text-gray-700 leading-relaxed">{props.children}</li>
                  ),
                  blockquote: (props) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 bg-gray-50 py-3 rounded-r my-4">
                      <p className="text-base leading-relaxed">{props.children}</p>
                    </blockquote>
                  ),
                  code: (props) => {
                    const isInline = !props.className;
                    if (isInline) {
                      return (
                        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200">
                          {props.children}
                        </code>
                      );
                    }
                    
                    const match = /language-(\w+)/.exec(props.className || '');
                    const language = match ? match[1] : 'text';
                    
                    return (
                      <div className="my-4">
                        <SyntaxHighlighter
                          language={language}
                          style={oneLight}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          {String(props.children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  pre: (props) => (
                    <div className="my-4">
                      {props.children}
                    </div>
                  ),
                  a: (props) => (
                    <a href={props.href} className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors">
                      {props.children}
                    </a>
                  ),
                  strong: (props) => (
                    <strong className="font-semibold text-gray-900">{props.children}</strong>
                  ),
                  em: (props) => (
                    <em className="italic text-gray-800">{props.children}</em>
                  ),
                  table: (props) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        {props.children}
                      </table>
                    </div>
                  ),
                  th: (props) => (
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      {props.children}
                    </th>
                  ),
                  td: (props) => (
                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      {props.children}
                    </td>
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {blog.tags && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.split(',').map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
} 