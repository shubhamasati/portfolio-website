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

interface SkillDomain {
  domain: string;
  technologies: string[];
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
  const [skillDomains, setSkillDomains] = useState<SkillDomain[]>([
    { domain: "Backend", technologies: [] },
    { domain: "Frontend", technologies: [] },
    { domain: "DevOps", technologies: [] },
    { domain: "Database", technologies: [] },
    { domain: "Tools", technologies: [] }
  ]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProjects(data.projects || []);
        setSocialMedia(data.socialMedia || []);
        
        // Parse skills from JSON or create default structure
        if (data.skills) {
          try {
            const parsedSkills = JSON.parse(data.skills);
            if (Array.isArray(parsedSkills)) {
              setSkillDomains(parsedSkills);
            }
          } catch {
                         // If skills is not JSON, treat as legacy format
             const legacySkills = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
             setSkillDomains([
               { domain: "Backend", technologies: legacySkills.filter((s: string) => 
                 ['java', 'spring', 'python', 'node', 'express', 'php', 'ruby', 'go', 'c#', '.net'].some(tech => 
                   s.toLowerCase().includes(tech)
                 )
               )},
               { domain: "Frontend", technologies: legacySkills.filter((s: string) => 
                 ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'tailwind'].some(tech => 
                   s.toLowerCase().includes(tech)
                 )
               )},
               { domain: "DevOps", technologies: legacySkills.filter((s: string) => 
                 ['docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'terraform', 'ansible'].some(tech => 
                   s.toLowerCase().includes(tech)
                 )
               )},
               { domain: "Database", technologies: legacySkills.filter((s: string) => 
                 ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql'].some(tech => 
                   s.toLowerCase().includes(tech)
                 )
               )},
               { domain: "Tools", technologies: legacySkills.filter((s: string) => 
                 !['java', 'spring', 'python', 'node', 'express', 'php', 'ruby', 'go', 'c#', '.net', 'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'tailwind', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql'].some(tech => 
                   s.toLowerCase().includes(tech)
                 )
               )}
             ]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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
      updateData.website = formData.get("website");
      updateData.github = formData.get("github");
      updateData.linkedin = formData.get("linkedin");
      updateData.availabilityStatus = formData.get("availabilityStatus");
    } else if (activeTab === "skills") {
      updateData.skills = JSON.stringify(skillDomains);
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

  // Skills management functions
  const addDomain = () => {
    setSkillDomains([...skillDomains, { domain: "", technologies: [] }]);
  };

  const removeDomain = (index: number) => {
    setSkillDomains(skillDomains.filter((_, i) => i !== index));
  };

  const updateDomain = (index: number, domain: string) => {
    const updated = [...skillDomains];
    updated[index].domain = domain;
    setSkillDomains(updated);
  };

  const addTechnology = (domainIndex: number) => {
    const updated = [...skillDomains];
    updated[domainIndex].technologies.push("");
    setSkillDomains(updated);
  };

  const removeTechnology = (domainIndex: number, techIndex: number) => {
    const updated = [...skillDomains];
    updated[domainIndex].technologies.splice(techIndex, 1);
    setSkillDomains(updated);
  };

  const updateTechnology = (domainIndex: number, techIndex: number, technology: string) => {
    const updated = [...skillDomains];
    updated[domainIndex].technologies[techIndex] = technology;
    setSkillDomains(updated);
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
              { id: "skills", name: "Skills & Experience" },
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile?.user?.name || ""}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={profile?.user?.email || ""}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This email will be displayed on your homepage for communication purposes. Your login email remains unchanged for security.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={profile?.title || ""}
                    placeholder="e.g., Full-Stack Developer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <select
                  name="availabilityStatus"
                  defaultValue={profile?.availabilityStatus || "available"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                >
                  <option value="available">Available</option>
                  <option value="open_to_work">Open to Work</option>
                  <option value="not_available">Busy</option>
                  <option value="freelance">Freelance</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="disabled">Disabled (Hide Label)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">This status will be shown on your homepage profile picture.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={profile?.location || ""}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    defaultValue={profile?.avatar || ""}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={profile?.bio || ""}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                <textarea
                  name="aboutMe"
                  rows={6}
                  defaultValue={profile?.aboutMe || ""}
                  placeholder="Share your detailed story, background, and what drives you..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    defaultValue={profile?.website || ""}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    defaultValue={profile?.github || ""}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    defaultValue={profile?.linkedin || ""}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
              <button
                onClick={() => {
                  setShowProjectForm(true);
                  setEditingProject(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Project
              </button>
            </div>

            {/* Project Form */}
            {showProjectForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h3>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingProject?.title || ""}
                        placeholder="Project Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technologies
                      </label>
                      <input
                        type="text"
                        name="technologies"
                        defaultValue={editingProject?.technologies || ""}
                        placeholder="React, Node.js, MongoDB"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingProject?.description || ""}
                      placeholder="Brief description of the project..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        name="imageUrl"
                        defaultValue={editingProject?.imageUrl || ""}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        name="liveUrl"
                        defaultValue={editingProject?.liveUrl || ""}
                        placeholder="https://project-demo.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        defaultValue={editingProject?.githubUrl || ""}
                        placeholder="https://github.com/username/project"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={editingProject?.featured || false}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Featured Project</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingProject?.order || 0}
                        min="0"
                        className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Projects List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No projects added yet. Click "Add New Project" to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <div key={project.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            {project.featured && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.split(",").map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                Live Demo
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
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
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Social Media Handles</h2>
              <button
                onClick={() => {
                  setShowSocialMediaForm(true);
                  setEditingSocialMedia(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Social Media
              </button>
            </div>

            {/* Social Media Form */}
            {showSocialMediaForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSocialMedia ? "Edit Social Media" : "Add New Social Media"}
                </h3>
                <form onSubmit={handleSocialMediaSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform
                      </label>
                      <select
                        name="platform"
                        defaultValue={editingSocialMedia?.platform || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required
                      >
                        <option value="">Select Platform</option>
                        <option value="GitHub">GitHub</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Medium">Medium</option>
                        <option value="Dev.to">Dev.to</option>
                        <option value="Stack Overflow">Stack Overflow</option>
                        <option value="Behance">Behance</option>
                        <option value="Dribbble">Dribbble</option>
                        <option value="Portfolio">Portfolio</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username (Optional)
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={editingSocialMedia?.username || ""}
                        placeholder="your-username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      defaultValue={editingSocialMedia?.url || ""}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon (Optional)
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={editingSocialMedia?.icon || ""}
                        placeholder="fab fa-github or custom icon class"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingSocialMedia?.order || 0}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSocialMediaForm(false);
                        setEditingSocialMedia(null);
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : editingSocialMedia ? "Update Social Media" : "Add Social Media"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Social Media List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {socialMedia.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No social media handles added yet. Click "Add Social Media" to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {socialMedia.map((social) => (
                    <div key={social.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{social.platform}</h3>
                            {social.username && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                @{social.username}
                              </span>
                            )}
                          </div>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {social.url}
                          </a>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditSocialMedia(social)}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSocialMedia(social.id)}
                            className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Skills & Experience Tab */}
        {activeTab === "skills" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Skills by Domain</h2>
                <button
                  onClick={addDomain}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Domain
                </button>
              </div>

              <div className="space-y-6">
                {skillDomains.map((domain, domainIndex) => (
                  <div key={domainIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={domain.domain}
                        onChange={(e) => updateDomain(domainIndex, e.target.value)}
                        placeholder="Domain name (e.g., Backend, DevOps)"
                        className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 placeholder-gray-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addTechnology(domainIndex)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          Add Technology
                        </button>
                        <button
                          onClick={() => removeDomain(domainIndex)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove Domain
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {domain.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={tech}
                            onChange={(e) => updateTechnology(domainIndex, techIndex, e.target.value)}
                            placeholder="Technology name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                          />
                          <button
                            onClick={() => removeTechnology(domainIndex, techIndex)}
                            className="px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {domain.technologies.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No technologies added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Experience & Education</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (JSON format)
                  </label>
                  <textarea
                    name="experience"
                    rows={6}
                    defaultValue={profile?.experience || ""}
                    placeholder='[{"company": "Tech Corp", "position": "Senior Developer", "duration": "2020-2023", "description": "Led development team..."}]'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">Use JSON format for structured experience data</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education (JSON format)
                  </label>
                  <textarea
                    name="education"
                    rows={6}
                    defaultValue={profile?.education || ""}
                    placeholder='[{"degree": "BS Computer Science", "school": "University", "year": "2020", "description": "Graduated with honors..."}]'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">Use JSON format for structured education data</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Skills & Experience"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
} 