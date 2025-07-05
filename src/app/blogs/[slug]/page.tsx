"use client";
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Article Header */}
          <header className="p-8 border-b border-gray-200">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span>5 min read</span>
              {blog.tags && (
                <>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {blog.tags.split(',')[0]?.trim() || 'Article'}
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
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        {props.children}
                      </table>
                    </div>
                  ),
                  th: (props) => (
                    <th className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {props.children}
                    </th>
                  ),
                  td: (props) => (
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                      {props.children}
                    </td>
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags Section */}
            {blog.tags && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.split(',').map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold text-sm">H</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hank Huge</p>
                  <p className="text-gray-600 text-sm">Full Stack Developer & Tech Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
} 