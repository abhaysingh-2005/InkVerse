import React, { useState, useRef, useEffect } from 'react';
import { assets, blogCategories } from '../assets/assets';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { parse } from 'marked';
import { useNavigate } from 'react-router-dom';

const UserAddBlog = () => {
  const navigate = useNavigate();
  const { axios, refreshBlogs } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(false);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState('Startup');
  const [isPublished, setIsPublished] = useState(true);
  const [author, setAuthor] = useState(localStorage.getItem('userName') || '');

  const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');

  const generateContent = async () => {
    if (!title) return toast.error('Please enter a title for AI generation');
    try {
      setLoading(true);

      const { data } = await axios.post('/api/blog/generate', { prompt: title }, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      if (data.success) {
        if (quillRef.current) {
          quillRef.current.root.innerHTML = parse(data.content);
        }
        toast.success("AI content generated!");
      } else {
        toast.error(data.message || "Something went wrong with AI generation.");
      }
    } catch (error) {
       toast.error(error.response?.data?.message || error.message || "Something went wrong with AI generation.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsAdding(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('subTitle', subTitle);
      if (quillRef.current) {
        formData.append('description', quillRef.current.root.innerHTML);
      }
      formData.append('category', category);
      formData.append('isPublished', isPublished);
      formData.append('image', image);
      formData.append('author', author || localStorage.getItem('userName') || 'Anonymous');

      const { data } = await axios.post('/api/blog/user-add', formData, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      if (data.success) {
        toast.success(data.message || "Blog created successfully!");
        await refreshBlogs();
        navigate('/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <form onSubmit={onSubmitHandler} className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>📝</span> Create New Post
          </h2>
          <p className="text-xs text-slate-400 mt-1">Publish your story or let AI draft the content for you</p>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Thumbnail Image</label>
          <label htmlFor="image" className="inline-block cursor-pointer">
            <div className="w-48 h-28 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 overflow-hidden transition">
              {!image ? (
                <div className="text-center p-3">
                  <span className="text-2xl mb-1 block">🖼️</span>
                  <span className="text-[11px]">Click to upload thumbnail</span>
                </div>
              ) : (
                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
          </label>
        </div>

        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Blog Title</label>
            <input 
              type="text" 
              placeholder="e.g. AI Trends in 2026" 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
              onChange={e => setTitle(e.target.value)} 
              value={title} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Sub Title</label>
            <input 
              type="text" 
              placeholder="Brief summary..." 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
              onChange={e => setSubTitle(e.target.value)} 
              value={subTitle} 
            />
          </div>
        </div>

        {/* Author & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Author Name</label>
            <input 
              type="text" 
              placeholder="Enter author name..." 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
              onChange={e => setAuthor(e.target.value)} 
              value={author} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {blogCategories.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description & AI Generator */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Content / Description</label>
            <button
              type="button"
              onClick={generateContent}
              disabled={loading}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden min-h-[180px]">
            <div ref={editorRef} className="text-slate-100"></div>
          </div>
        </div>

        {/* Publish Checkbox & Action Button */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isPublished} 
              onChange={e => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
            Publish Post Immediately
          </label>

          <button 
            disabled={isAdding} 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {isAdding ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAddBlog;
