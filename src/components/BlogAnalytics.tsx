"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalClaps: number;
  averageViewsPerPost: number;
  averageClapsPerPost: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    claps: number;
    slug: string;
    category: string | null;
    featured: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    action: string;
    date: string;
    status: string;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  viewsVisibilityStats: {
    showViewsEnabled: number;
    showViewsDisabled: number;
  };
}

export default function BlogAnalytics() {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/blogs");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blogs = await response.json();
      
      if (!Array.isArray(blogs)) {
        console.error("Expected blogs array, got:", blogs);
        setAnalytics({
          totalPosts: 0,
          publishedPosts: 0,
          draftPosts: 0,
          totalViews: 0,
          totalClaps: 0,
          averageViewsPerPost: 0,
          averageClapsPerPost: 0,
          topPosts: [],
          recentActivity: [],
          categoryDistribution: [],
          viewsVisibilityStats: { showViewsEnabled: 0, showViewsDisabled: 0 },
        });
        return;
      }

      // Calculate analytics
      const totalPosts = blogs.length;
      const publishedPosts = blogs.filter((blog: any) => blog.published).length;
      const draftPosts = totalPosts - publishedPosts;
      const totalViews = blogs.reduce((sum: number, blog: any) => sum + (blog.views || 0), 0);
      const totalClaps = blogs.reduce((sum: number, blog: any) => sum + (blog.claps || 0), 0);
      const averageViewsPerPost = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;
      const averageClapsPerPost = publishedPosts > 0 ? Math.round(totalClaps / publishedPosts) : 0;

      // Views visibility stats
      const showViewsEnabled = blogs.filter((blog: any) => blog.showViews).length;
      const showViewsDisabled = totalPosts - showViewsEnabled;

      // Top posts by views
      const topPosts = blogs
        .filter((blog: any) => blog.published)
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5)
        .map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          views: blog.views,
          claps: blog.claps,
          slug: blog.slug,
          category: blog.category,
          featured: blog.featured,
        }));

      // Recent activity (last 5 posts)
      const recentActivity = blogs
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          action: blog.published ? "Published" : "Updated",
          date: new Date(blog.updatedAt).toLocaleDateString(),
          status: blog.status,
        }));

      // Category distribution
      const categoryCounts: { [key: string]: number } = {};
      blogs.forEach((blog: any) => {
        const category = blog.category || "Uncategorized";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      setAnalytics({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalClaps,
        averageViewsPerPost,
        averageClapsPerPost,
        topPosts,
        recentActivity,
        categoryDistribution,
        viewsVisibilityStats: { showViewsEnabled, showViewsDisabled },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Your Blog Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Manage your content, track performance, and engage with your audience
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.totalPosts || 0}</div>
                <div className="text-blue-100 text-sm">Total Posts</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">{(analytics.totalViews || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(analytics.averageViewsPerPost || 0)} avg per post
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Claps</p>
              <p className="text-3xl font-bold text-gray-900">{(analytics.totalClaps || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(analytics.averageClapsPerPost || 0)} avg per post
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Published Posts</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.publishedPosts || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.draftPosts || 0} drafts
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {(analytics.totalViews || 0) > 0 ? Math.round(((analytics.totalClaps || 0) / (analytics.totalViews || 1)) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                claps per view
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Views Visibility Control Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Views Visibility Control</h3>
          <span className="text-sm text-gray-500">Per-blog settings</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Views Visible</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{analytics.viewsVisibilityStats?.showViewsEnabled || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Views Hidden</span>
            </div>
            <span className="text-2xl font-bold text-gray-600">{analytics.viewsVisibilityStats?.showViewsDisabled || 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Top Posts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Posts</h3>
            <p className="text-sm text-gray-500">By total views</p>
          </div>
          <div className="p-6">
            {analytics.topPosts?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 truncate max-w-xs">{post.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">{(post.views || 0).toLocaleString()} views</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{post.claps || 0} claps</span>
                          {post.category && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {post.category}
                              </span>
                            </>
                          )}
                          {post.featured && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No published posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first blog post to see analytics</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest updates</p>
          </div>
          <div className="p-6">
            {analytics.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 truncate max-w-xs">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        activity.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : activity.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {activity.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Start creating content to see activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Content Categories</h3>
          <p className="text-sm text-gray-500">Distribution of your blog posts</p>
        </div>
        <div className="p-6">
          {analytics.categoryDistribution?.length > 0 ? (
            <div className="space-y-4">
              {analytics.categoryDistribution.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-500">({category.count || 0} posts)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${((category.count || 0) / (analytics.totalPosts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(((category.count || 0) / (analytics.totalPosts || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-gray-500">No categories assigned</p>
              <p className="text-sm text-gray-400 mt-1">Add categories to your posts for better organization</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/blogs/new"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Create New Post</p>
              <p className="text-sm text-gray-500">Start writing</p>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard?tab=posts"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Posts</p>
              <p className="text-sm text-gray-500">Edit & organize</p>
            </div>
          </Link>
          
          <Link
            href="/admin/profile"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Update Profile</p>
              <p className="text-sm text-gray-500">Personal info</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 