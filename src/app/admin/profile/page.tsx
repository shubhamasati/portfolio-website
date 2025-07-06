"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Profile {
  id: string;
  bio: string;
  aboutMe: string;
  title: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  skills: string;
  experience: string;
  education: string;
  avatar: string;
  user?: {
    name: string;
    email: string;
  };
  projects: Project[];
  socialMedia: SocialMedia[];
  availabilityStatus: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  order: number;
}

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  username?: string;
  icon?: string;
  order: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description?: string;
}

export default function ProfileManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showSocialMediaForm, setShowSocialMediaForm] = useState(false);
  const [editingSocialMedia, setEditingSocialMedia] = useState<SocialMedia | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [skillDomains, setSkillDomains] = useState<any[]>([]);
  const [editingDomain, setEditingDomain] = useState<any>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillFormData, setSkillFormData] = useState({
    domain: '',
    expertise: 'Advanced',
    technologies: '',
    icon: '',
    order: 0
  });

  const expertiseLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchProfile();
    fetchSkillDomains();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProjects(data.projects || []);
        setSocialMedia(data.socialMedia || []);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchSkillDomains = async () => {
    try {
      const response = await fetch('/api/skill-domains');
      const data = await response.json();
      setSkillDomains(data);
    } catch (error) {
      console.error('Error fetching skill domains:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const updateData: any = {};

    // Handle different form types based on active tab
    if (activeTab === "profile") {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      
      // Update user name and email first if they changed
      if ((name && name !== profile?.user?.name) || (email && email !== profile?.user?.email)) {
        try {
          console.log("Updating user info:", { name, email, currentEmail: profile?.user?.email });
          const userResponse = await fetch("/api/user", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email }),
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error("User update failed:", errorData);
            setMessage(errorData.error || "Failed to update user information");
            setSaving(false);
            return;
          }

          console.log("User update successful");
          // Don't reload the page, just refresh the profile data
          await fetchProfile();
          setMessage("User information updated successfully!");
          setSaving(false);
          return;
        } catch (error) {
          console.error("User update error:", error);
          setMessage("An error occurred while updating user information");
          setSaving(false);
          return;
        }
      }

      updateData.title = formData.get("title");
      updateData.location = formData.get("location");
      updateData.avatar = formData.get("avatar");
      updateData.bio = formData.get("bio");
      updateData.aboutMe = formData.get("aboutMe");
      updateData.availabilityStatus = formData.get("availabilityStatus");
    } else if (activeTab === "experience") {
      updateData.experience = formData.get("experience");
      updateData.education = formData.get("education");
    }

    try {
      console.log("Updating profile data:", updateData);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
        fetchProfile();
      } else {
        const errorData = await response.json();
        console.error("Profile update failed:", errorData);
        setMessage(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const projectData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      technologies: formData.get("technologies") as string,
      imageUrl: formData.get("imageUrl") as string,
      liveUrl: formData.get("liveUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      featured: formData.get("featured") === "on",
      order: parseInt(formData.get("order") as string) || 0,
    };

    try {
      const url = editingProject 
        ? `/api/projects/${editingProject.id}` 
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setShowProjectForm(false);
        setEditingProject(null);
        fetchProfile();
        setMessage(editingProject ? "Project updated successfully!" : "Project added successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to save project");
      }
    } catch (error) {
      setMessage("An error occurred while saving project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProfile();
        setMessage("Project deleted successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to delete project");
      }
    } catch (error) {
      setMessage("An error occurred while deleting project");
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Social Media management functions
  const handleSocialMediaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const socialMediaData = {
      platform: formData.get("platform") as string,
      url: formData.get("url") as string,
      username: formData.get("username") as string,
      icon: formData.get("icon") as string,
      order: parseInt(formData.get("order") as string) || 0,
    };

    try {
      const url = editingSocialMedia 
        ? `/api/social-media/${editingSocialMedia.id}` 
        : "/api/social-media";
      const method = editingSocialMedia ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(socialMediaData),
      });

      if (response.ok) {
        setShowSocialMediaForm(false);
        setEditingSocialMedia(null);
        fetchProfile();
        setMessage(editingSocialMedia ? "Social media updated successfully!" : "Social media added successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to save social media");
      }
    } catch (error) {
      setMessage("An error occurred while saving social media");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocialMedia = async (socialMediaId: string) => {
    if (!confirm("Are you sure you want to delete this social media handle?")) return;

    try {
      const response = await fetch(`/api/social-media/${socialMediaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProfile();
        setMessage("Social media handle deleted successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to delete social media handle");
      }
    } catch (error) {
      setMessage("An error occurred while deleting social media handle");
    }
  };

  const handleEditSocialMedia = (socialMedia: SocialMedia) => {
    setEditingSocialMedia(socialMedia);
    setShowSocialMediaForm(true);
  };

  // Skill Domain handlers
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const technologies = skillFormData.technologies.split(',').map(tech => tech.trim());
      
      const response = await fetch('/api/skill-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...skillFormData,
          technologies
        })
      });

      if (response.ok) {
        setSkillFormData({ domain: '', expertise: 'Advanced', technologies: '', icon: '', order: 0 });
        setShowSkillForm(false);
        fetchSkillDomains();
        setMessage("Skill domain added successfully!");
      }
    } catch (error) {
      console.error('Error creating skill domain:', error);
      setMessage("Failed to create skill domain");
    }
  };

  const handleSkillUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDomain) return;

    try {
      const technologies = skillFormData.technologies.split(',').map(tech => tech.trim());
      
      const response = await fetch(`/api/skill-domains/${editingDomain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...skillFormData,
          technologies
        })
      });

      if (response.ok) {
        setEditingDomain(null);
        setSkillFormData({ domain: '', expertise: 'Advanced', technologies: '', icon: '', order: 0 });
        fetchSkillDomains();
        setMessage("Skill domain updated successfully!");
      }
    } catch (error) {
      console.error('Error updating skill domain:', error);
      setMessage("Failed to update skill domain");
    }
  };

  const handleSkillDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill domain?')) return;

    try {
      const response = await fetch(`/api/skill-domains/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSkillDomains();
        setMessage("Skill domain deleted successfully!");
      }
    } catch (error) {
      console.error('Error deleting skill domain:', error);
      setMessage("Failed to delete skill domain");
    }
  };

  const handleSkillEdit = (domain: any) => {
    setEditingDomain(domain);
    setSkillFormData({
      domain: domain.domain,
      expertise: domain.expertise,
      technologies: JSON.parse(domain.technologies).join(', '),
      icon: domain.icon || '',
      order: domain.order
    });
  };

  // Skills management functions
  const handleSkillFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const skillData = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      proficiency: parseInt(formData.get("proficiency") as string),
      description: formData.get("description") as string,
    };

    try {
      const url = editingSkill 
        ? `/api/skills/${editingSkill.id}` 
        : "/api/skills";
      const method = editingSkill ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skillData),
      });

      if (response.ok) {
        setShowSkillForm(false);
        setEditingSkill(null);
        fetchSkills();
        setMessage(editingSkill ? "Skill updated successfully!" : "Skill added successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to save skill");
      }
    } catch (error) {
      console.error("Skill save error:", error);
      setMessage("An error occurred while saving skill");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSkills();
        setMessage("Skill deleted successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to delete skill");
      }
    } catch (error) {
      console.error("Skill delete error:", error);
      setMessage("An error occurred while deleting skill");
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setShowSkillForm(true);
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    }
  };



  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                ← Back to Dashboard
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "profile", name: "Profile Info" },
              { id: "social-media", name: "Social Media" },
              { id: "projects", name: "Projects" },
              { id: "skill-domains", name: "Skill Domains" },
              { id: "experience", name: "Experience & Education" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Profile Info Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile?.user?.name || 'Your Name'}
                  </h2>
                  <p className="text-gray-600">{profile?.user?.email || 'your.email@example.com'}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Profile Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Profile Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                <p className="text-gray-600 mt-1">Update your personal and professional details</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* User Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Account Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={profile?.user?.name || ""}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={profile?.user?.email || ""}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Professional Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={profile?.title || ""}
                        placeholder="e.g., Full-Stack Developer"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={profile?.location || ""}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Availability Status
                    </label>
                    <select
                      name="availabilityStatus"
                      defaultValue={profile?.availabilityStatus || "available"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="available">🟢 Available</option>
                      <option value="open_to_work">🟡 Open to Work</option>
                      <option value="not_available">🔴 Busy</option>
                      <option value="freelance">💼 Freelance</option>
                      <option value="part_time">⏰ Part Time</option>
                      <option value="contract">📋 Contract</option>
                      <option value="disabled">⚪ Disabled (Hide Label)</option>
                    </select>
                    <p className="text-sm text-gray-500">This status will be displayed on your homepage profile picture.</p>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">About You</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Short Bio
                      </label>
                      <input
                        type="text"
                        name="bio"
                        defaultValue={profile?.bio || ""}
                        placeholder="A brief introduction about yourself"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Detailed About Me
                      </label>
                      <textarea
                        name="aboutMe"
                        rows={4}
                        defaultValue={profile?.aboutMe || ""}
                        placeholder="Tell visitors more about your background, skills, and what drives you..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Profile Picture</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      defaultValue={profile?.avatar || ""}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                    />
                    <p className="text-sm text-gray-500">Enter the URL of your profile picture</p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Project Portfolio</h2>
                  <p className="text-gray-600">Showcase your best work and achievements</p>
                </div>
              </div>
            </div>

            {/* Add Project Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Your Projects</h3>
                <p className="text-gray-600 mt-1">Manage your portfolio projects and showcase your work</p>
              </div>
              <button
                onClick={() => {
                  setShowProjectForm(true);
                  setEditingProject(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Project</span>
              </button>
            </div>

            {/* Project Form */}
            {showProjectForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <p className="text-gray-600 mt-1">Configure your project details and showcase information</p>
                </div>
                
                <form onSubmit={handleProjectSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingProject?.title || ""}
                        placeholder="e.g., E-commerce Platform"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Technologies Used
                      </label>
                      <input
                        type="text"
                        name="technologies"
                        defaultValue={editingProject?.technologies || ""}
                        placeholder="React, Node.js, MongoDB"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={editingProject?.description || ""}
                      placeholder="Describe your project, its features, and what you learned..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Image URL
                      </label>
                      <input
                        type="url"
                        name="imageUrl"
                        defaultValue={editingProject?.imageUrl || ""}
                        placeholder="https://example.com/project-image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingProject?.order || 0}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        name="liveUrl"
                        defaultValue={editingProject?.liveUrl || ""}
                        placeholder="https://your-project.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        GitHub Repository
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        defaultValue={editingProject?.githubUrl || ""}
                        placeholder="https://github.com/username/project"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={editingProject?.featured || false}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Feature this project on homepage
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                      }}
                      className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {saving ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Projects List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Projects ({projects.length})
                </h3>
              </div>
              
              {projects.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects added yet</h3>
                  <p className="text-gray-500 mb-6">Add your projects to showcase your work and skills</p>
                  <button
                    onClick={() => {
                      setShowProjectForm(true);
                      setEditingProject(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                  >
                    Add Your First Project
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                              {project.featured && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  Featured
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                Order: {project.order}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.split(',').map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                            <div className="flex space-x-3">
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                                >
                                  Live Demo →
                                </a>
                              )}
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                                >
                                  GitHub →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="px-4 py-2 text-orange-600 hover:text-orange-700 border border-orange-600 rounded-lg hover:bg-orange-50 transition-all duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}



        {/* Social Media Tab */}
        {activeTab === "social-media" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
                  <p className="text-gray-600">Connect your social media profiles to showcase your online presence</p>
                </div>
              </div>
            </div>

            {/* Add Social Media Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Your Social Profiles</h3>
                <p className="text-gray-600 mt-1">Manage your social media links and display order</p>
              </div>
              <button
                onClick={() => {
                  setShowSocialMediaForm(true);
                  setEditingSocialMedia(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Social Media</span>
              </button>
            </div>

            {/* Social Media Form */}
            {showSocialMediaForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingSocialMedia ? 'Edit Social Media Profile' : 'Add New Social Media Profile'}
                  </h3>
                  <p className="text-gray-600 mt-1">Configure your social media profile details</p>
                </div>
                
                <form onSubmit={handleSocialMediaSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Platform
                      </label>
                      <select
                        name="platform"
                        defaultValue={editingSocialMedia?.platform || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all duration-200 hover:border-gray-400"
                        required
                      >
                        <option value="">Select Platform</option>
                        <option value="GitHub">🐙 GitHub</option>
                        <option value="LinkedIn">💼 LinkedIn</option>
                        <option value="Twitter">🐦 Twitter</option>
                        <option value="Instagram">📸 Instagram</option>
                        <option value="YouTube">📺 YouTube</option>
                        <option value="Facebook">📘 Facebook</option>
                        <option value="Medium">📝 Medium</option>
                        <option value="Dev.to">💻 Dev.to</option>
                        <option value="Stack Overflow">🔧 Stack Overflow</option>
                        <option value="Behance">🎨 Behance</option>
                        <option value="Dribbble">🏀 Dribbble</option>
                        <option value="Portfolio">🎯 Portfolio</option>
                        <option value="Other">🔗 Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Username (Optional)
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={editingSocialMedia?.username || ""}
                        placeholder="your-username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      defaultValue={editingSocialMedia?.url || ""}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Icon (Optional)
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={editingSocialMedia?.icon || ""}
                        placeholder="fab fa-github or custom icon class"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingSocialMedia?.order || 0}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSocialMediaForm(false);
                        setEditingSocialMedia(null);
                      }}
                      className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {saving ? "Saving..." : editingSocialMedia ? "Update Profile" : "Add Profile"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Social Media List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Connected Profiles ({socialMedia.length})
                </h3>
              </div>
              
              {socialMedia.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No social media profiles yet</h3>
                  <p className="text-gray-500 mb-6">Add your social media profiles to showcase your online presence</p>
                  <button
                    onClick={() => {
                      setShowSocialMediaForm(true);
                      setEditingSocialMedia(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Add Your First Profile
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {socialMedia.map((social) => (
                    <motion.div
                      key={social.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <span className="text-lg">
                              {social.platform === 'GitHub' && '🐙'}
                              {social.platform === 'LinkedIn' && '💼'}
                              {social.platform === 'Twitter' && '🐦'}
                              {social.platform === 'Instagram' && '📸'}
                              {social.platform === 'YouTube' && '📺'}
                              {social.platform === 'Facebook' && '📘'}
                              {social.platform === 'Medium' && '📝'}
                              {social.platform === 'Dev.to' && '💻'}
                              {social.platform === 'Stack Overflow' && '🔧'}
                              {social.platform === 'Behance' && '🎨'}
                              {social.platform === 'Dribbble' && '🏀'}
                              {social.platform === 'Portfolio' && '🎯'}
                              {social.platform === 'Other' && '🔗'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{social.platform}</h3>
                              {social.username && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  @{social.username}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                Order: {social.order}
                              </span>
                            </div>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                            >
                              {social.url}
                            </a>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSocialMedia(social)}
                            className="px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSocialMedia(social.id)}
                            className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Skill Domains Tab */}
        {activeTab === "skill-domains" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Skill Domains</h2>
              <button
                onClick={() => setShowSkillForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Domain
              </button>
            </div>

            {/* Skill Domain Form */}
            {(showSkillForm || editingDomain) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingDomain ? 'Edit Skill Domain' : 'Add New Skill Domain'}
                </h3>
                <form onSubmit={editingDomain ? handleSkillUpdate : handleSkillSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain Name
                      </label>
                      <input
                        type="text"
                        value={skillFormData.domain}
                        onChange={(e) => setSkillFormData({ ...skillFormData, domain: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Backend Development"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expertise Level
                      </label>
                      <select
                        value={skillFormData.expertise}
                        onChange={(e) => setSkillFormData({ ...skillFormData, expertise: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      >
                        {expertiseLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={skillFormData.icon}
                        onChange={(e) => setSkillFormData({ ...skillFormData, icon: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        value={skillFormData.order}
                        onChange={(e) => setSkillFormData({ ...skillFormData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies (comma-separated)
                    </label>
                    <textarea
                      value={skillFormData.technologies}
                      onChange={(e) => setSkillFormData({ ...skillFormData, technologies: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      rows={3}
                      placeholder="React, Next.js, TypeScript, Tailwind CSS"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingDomain ? 'Update Domain' : 'Add Domain'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillForm(false);
                        setEditingDomain(null);
                        setSkillFormData({ domain: '', expertise: 'Advanced', technologies: '', icon: '', order: 0 });
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Skill Domains List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Skill Domains ({skillDomains.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {skillDomains.map((domain) => (
                  <div key={domain.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{domain.icon || '🔧'}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {domain.domain}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              domain.expertise === 'Expert' ? 'bg-red-100 text-red-800' :
                              domain.expertise === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                              domain.expertise === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {domain.expertise}
                            </span>
                            <span className="text-sm text-gray-500">
                              {JSON.parse(domain.technologies).length} technologies
                            </span>
                            <span className="text-sm text-gray-500">
                              Order: {domain.order}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSkillEdit(domain)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSkillDelete(domain.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {skillDomains.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No skill domains found. Add your first one above!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Experience & Education Tab */}
        {activeTab === "experience" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Experience & Education</h2>
                  <p className="text-gray-600">Manage your professional experience and educational background</p>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Professional Background</h3>
                <p className="text-gray-600 mt-1">Update your work experience and education details</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Work Experience Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Work Experience</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Work Experience (JSON format)
                      </label>
                      <textarea
                        name="experience"
                        rows={8}
                        defaultValue={profile?.experience || ""}
                        placeholder='[{"company": "Tech Corp", "position": "Senior Developer", "duration": "2020-2023", "description": "Led development team and implemented key features..."}]'
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 font-mono text-sm transition-all duration-200 hover:border-gray-400 resize-none"
                      />
                      <p className="text-sm text-gray-500">
                        Use JSON format to structure your work experience. Include company, position, duration, and description for each role.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Education</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Education History (JSON format)
                      </label>
                      <textarea
                        name="education"
                        rows={8}
                        defaultValue={profile?.education || ""}
                        placeholder='[{"degree": "BS Computer Science", "school": "University Name", "year": "2020", "description": "Graduated with honors, specialized in software engineering..."}]'
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 font-mono text-sm transition-all duration-200 hover:border-gray-400 resize-none"
                      />
                      <p className="text-sm text-gray-500">
                        Use JSON format to structure your education. Include degree, school, year, and description for each qualification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* JSON Format Help */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">JSON Format Guide</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Work Experience:</strong> Include company name, position, duration, and detailed description of your role and achievements.</p>
                    <p><strong>Education:</strong> Include degree, institution name, graduation year, and any relevant details about your studies.</p>
                    <p className="text-xs bg-blue-100 p-2 rounded border border-blue-200 font-mono">
                      Example: [&#123;"company": "Tech Corp", "position": "Senior Developer", "duration": "2020-2023", "description": "Led development team..."&#125;]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}