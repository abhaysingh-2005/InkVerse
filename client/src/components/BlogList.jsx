import { useState } from 'react';
import { blogCategories } from '../assets/assets';
import BlogCard from './BlogCard';
import EditBlogModal from './EditBlogModal';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const BlogList = () => {
  const [menu, setMenu] = useState("All");
  const { blogs, setBlogs, input, axios } = useAppContext();
  
  const [editingBlog, setEditingBlog] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const currentUserName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('token');

  // Check if current logged-in user is a verified Admin
  const isAdmin = userRole === 'Admin' || (adminToken && !userToken);

  // Strict ownership check: Only true if user is Admin OR user is the exact author (and not Anonymous)
  const canEditBlog = (blog) => {
    if (!blog) return false;
    if (isAdmin) return true;
    if (!userToken || !currentUserName || !blog.author || blog.author === 'Anonymous') {
      return false;
    }
    return blog.author.trim().toLowerCase() === currentUserName.trim().toLowerCase();
  };

  const canDeleteBlog = (blog) => {
    if (!blog) return false;
    if (isAdmin) return true;
    if (!userToken || !currentUserName || !blog.author || blog.author === 'Anonymous') {
      return false;
    }
    return blog.author.trim().toLowerCase() === currentUserName.trim().toLowerCase();
  };

  const filteredBlogs = () => {
    if (!input) return blogs;
    const search = String(input).toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(search) ||
        (blog.category && blog.category.toLowerCase().includes(search))
    );
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsEditOpen(true);
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const authToken = userToken || adminToken;

      const { data } = await axios.post(
        '/api/blog/delete',
        { id: blogId, userName: currentUserName },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.success) {
        toast.success("Blog deleted successfully!");
        setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      } else {
        toast.error(data.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong while deleting");
    }
  };

  const handleBlogUpdated = (updatedBlog) => {
    setBlogs((prev) => prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b)));
  };

  const currentCategoryBlogs = filteredBlogs().filter(
    (blog) => menu === "All" ? true : blog.category === menu
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8">
      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-10 relative">
        {blogCategories.map((item) => (
          <div key={item} className="relative">
            <button
              onClick={() => setMenu(item)}
              className={`cursor-pointer px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
                menu === item
                  ? 'text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 shadow-lg shadow-cyan-600/30 border border-cyan-400/40 scale-105'
                  : 'text-slate-400 hover:text-white bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md'
              }`}
            >
              {item}
            </button>
          </div>
        ))}
      </div>

      {/* Grid of Cards */}
      {currentCategoryBlogs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800/80 rounded-3xl my-8">
          <p className="text-slate-400 text-sm font-medium">No articles found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
          {currentCategoryBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={canEditBlog(blog) ? handleEdit : undefined}
              onDelete={canDeleteBlog(blog) ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

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

export default BlogList;



