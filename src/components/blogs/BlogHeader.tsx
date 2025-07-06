"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Profile {
  user?: {
    name: string;
    email: string;
  };
}

export default function BlogHeader() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/public/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.user?.name || "Hank";

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-100/95 backdrop-blur-xl border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {displayName}
            </Link>
            <Link 
              href="/" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View Author Profile
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Knowledge <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Deep dives into web development, practical tutorials, and insights from the frontlines of modern software engineering
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
} 