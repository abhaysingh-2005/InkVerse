import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { parse } from 'marked';
import { useAppContext } from '../context/AppContext';
import { blogCategories } from '../assets/assets';

const EditBlogModal = ({ blog, isOpen, onClose, onUpdated }) => {
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState('Startup');
  const [author, setAuthor] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (blog && isOpen) {
      setTitle(blog.title || '');
      setSubTitle(blog.subTitle || '');
      setCategory(blog.category || 'Startup');
      setAuthor(blog.author || '');
      setIsPublished(blog.isPublished !== undefined ? blog.isPublished : true);
      setImagePreview(blog.image || '');
      setImage(null);

      // Initialize or set Quill content
      setTimeout(() => {
        if (editorRef.current && !quillRef.current) {
          quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
        }
        if (quillRef.current) {
          quillRef.current.root.innerHTML = blog.description || '';
        }
      }, 100);
    }
  }, [blog, isOpen]);

  if (!isOpen || !blog) return null;

  const handleGenerateAI = async () => {
    if (!title) return toast.error('Please enter a title for AI generation');
    try {
      setAiLoading(true);
      const userToken = localStorage.getItem('userToken');
      const token = localStorage.getItem('token');
      const authToken = userToken || token;

      const { data } = await axios.post(
        '/api/blog/generate',
        { prompt: title },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.success) {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = parse(data.content);
        }
        toast.success("AI content generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate AI content");
      }
    } catch (error) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userToken = localStorage.getItem('userToken');
      const token = localStorage.getItem('token');
      const authToken = userToken || token;

      const formData = new FormData();
      formData.append('id', blog._id);
      formData.append('title', title);
      formData.append('subTitle', subTitle);
      if (quillRef.current) {
        formData.append('description', quillRef.current.root.innerHTML);
      }
      formData.append('category', category);
      formData.append('author', author);
      formData.append('isPublished', isPublished);
      if (image) {
        formData.append('image', image);
      }

      const { data } = await axios.post('/api/blog/update', formData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (data.success) {
        toast.success(data.message || "Blog updated successfully!");
        if (onUpdated) onUpdated(data.blog);
        onClose();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong updating blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 sm:p-8 text-slate-100 shadow-2xl my-8 relative">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✏️</span> Edit Blog Post
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Update title, thumbnail, description and category</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Thumbnail Image</label>
            <div className="flex items-center gap-4">
              <img
                src={image ? URL.createObjectURL(image) : imagePreview}
                alt="Thumbnail"
                className="w-24 h-16 object-cover rounded-lg border border-slate-700 bg-slate-800"
              />
              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition">
                Change Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Blog Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Enter title..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Sub Title</label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Enter subtitle..."
              />
            </div>
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {blogCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Description Editor */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Content / Description</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? "Generating..." : "✨ Regenerate with AI"}
              </button>
            </div>
            <div className="bg-slate-800 text-white rounded-lg border border-slate-700 overflow-hidden">
              <div ref={editorRef} className="min-h-[160px] text-white"></div>
            </div>
          </div>

          {/* Publish Checkbox & Action Buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 rounded"
              />
              Publish Post Now
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlogModal;
