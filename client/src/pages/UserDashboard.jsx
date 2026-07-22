import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import EditBlogModal from '../components/EditBlogModal';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { blogs: allBlogs, axios } = useAppContext();
  const [myBlogs, setMyBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingBlog, setEditingBlog] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const currentUserName = localStorage.getItem('userName');
  const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/blog/user-blogs', {
        params: { userName: currentUserName, userRole: userRole },
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (data.success) {
        if (userRole === 'Admin') {
          // Admin Dashboard displays all Admin and Anonymous authored posts
          setMyBlogs(data.blogs);
        } else {
          // Regular user dashboard displays only posts written by that user
          const userOnlyBlogs = data.blogs.filter(
            (b) => b.author && currentUserName && b.author.trim().toLowerCase() === currentUserName.trim().toLowerCase()
          );
          setMyBlogs(userOnlyBlogs);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedBlogs = () => {
    const savedIds = JSON.parse(localStorage.getItem('savedBlogIds') || '[]');
    const bookmarked = allBlogs.filter((b) => savedIds.includes(b._id));
    setSavedBlogs(bookmarked);
  };

  useEffect(() => {
    fetchUserBlogs();
  }, [userToken, currentUserName]);

  useEffect(() => {
    loadSavedBlogs();
  }, [allBlogs]);

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsEditOpen(true);
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { data } = await axios.post(
        '/api/blog/delete',
        { id: blogId, userName: currentUserName },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (data.success) {
        toast.success("Blog deleted successfully!");
        setMyBlogs((prev) => prev.filter((b) => b._id !== blogId));
      } else {
        toast.error(data.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error.message || "Error deleting blog");
    }
  };

  const handleBlogUpdated = (updatedBlog) => {
    setMyBlogs((prev) => prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b)));
  };

  const publishedCount = myBlogs.filter((b) => b.isPublished).length;
  const draftCount = myBlogs.length - publishedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 text-slate-100 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📊</span> My Creator Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your published articles and view your bookmarked reading list</p>
        </div>
        <button 
          onClick={() => navigate('/add-blog')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2 text-xs"
        >
          <span className="text-base font-bold">+</span> Create New Blog
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Articles</p>
          <p className="text-3xl font-extrabold text-white mt-1">{myBlogs.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published</p>
          <p className="text-3xl font-extrabold text-green-400 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved / Bookmarked</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">{savedBlogs.length}</p>
        </div>
      </div>

      {/* ================= SECTION 1: MY ARTICLES ================= */}
      <div className="mb-14">
        <h2 className="text-2xl font-extrabold mb-6 text-white flex items-center gap-2">
          <span>✍️</span> My Published Articles ({myBlogs.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse">Loading your articles...</div>
        ) : myBlogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
            <p className="text-slate-400 mb-4 text-sm">You haven't published any blogs yet.</p>
            <button 
              onClick={() => navigate('/add-blog')}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer shadow-md"
            >
              Write your first blog post →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= SECTION 2: SAVED BLOGS ================= */}
      <div className="pt-8 border-t border-slate-800/80 mb-20">
        <h2 className="text-2xl font-extrabold mb-6 text-white flex items-center gap-2">
          <span>🔖</span> Saved & Bookmarked Articles ({savedBlogs.length})
        </h2>

        {savedBlogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/80 p-8">
            <p className="text-slate-400 text-sm">No saved articles yet. Click the 🔖 icon on any blog to save it to your reading list!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onSaveToggle={loadSavedBlogs}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditBlogModal
        blog={editingBlog}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={handleBlogUpdated}
      />
    </div>
  );
};

export default UserDashboard;
