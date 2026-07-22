import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'; 
import Navbar from '../components/Navbar';
import Moment from 'moment';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import EditBlogModal from '../components/EditBlogModal';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const Blog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const currentUserName = localStorage.getItem('userName');
  const hasToken = !!localStorage.getItem('userToken') || !!localStorage.getItem('token');

  const fetchBlogData = async () => {
    try {
      const { data } = await axios.get(`/api/blog/${id}`);
      data.success ? setData(data.blog) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axios.post('/api/blog/comments', { blogId: id });
      if (data.success) {
        setComments(data.comments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/blog/add-comment', { blog: id, name, content });
      if (data.success) {
        toast.success(data.message);
        setName('');
        setContent('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const userToken = localStorage.getItem('userToken');
      const token = localStorage.getItem('token');
      const authToken = userToken || token;

      const { data } = await axios.post(
        '/api/blog/delete',
        { id, userName: currentUserName },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.success) {
        toast.success("Blog deleted successfully!");
        navigate('/');
      } else {
        toast.error(data.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, [id]);

  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('token');
  const isAdmin = userRole === 'Admin' || (adminToken && !userToken);
  const isOwner = !!(data?.author && currentUserName && data.author !== 'Anonymous' && data.author.trim().toLowerCase() === currentUserName.trim().toLowerCase());

  const canEdit = isAdmin || isOwner;
  const canDelete = isAdmin || isOwner;

  return data ? (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {/* Header Metadata */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300 mb-4">
            <span>{data.category || 'Article'}</span>
            <span>•</span>
            <span>Published {Moment(data.createdAt).format('MMM Do, YYYY')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto mb-4">
            {data.title}
          </h1>

          {data.subTitle && (
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-6">
              {data.subTitle}
            </p>
          )}

          {/* Author Badge & Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                {(data.author || 'A')[0].toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200">Written by {data.author || 'Anonymous'}</span>
            </div>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 px-3 rounded-full">
                {canEdit && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-medium px-2 py-0.5 transition cursor-pointer"
                  >
                    ✏️ Edit Post
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteBlog}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium px-2 py-0.5 transition cursor-pointer"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden mb-10 border border-slate-800 shadow-2xl aspect-video bg-slate-900">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div 
          className="rich-text max-w-3xl mx-auto leading-relaxed border-b border-slate-800 pb-12" 
          dangerouslySetInnerHTML={{ __html: data.description }}
        ></div>

        {/* Comments Section */}
        <section className="max-w-3xl mx-auto pt-10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            💬 Reader Comments ({comments.length})
          </h3>

          {/* List Comments */}
          <div className="space-y-4 mb-10">
            {comments.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No comments yet. Be the first to start the discussion!</p>
            ) : (
              comments.map((item, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl text-slate-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-xs flex items-center justify-center font-bold">
                        {item.name[0].toUpperCase()}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500">{Moment(item.createdAt).fromNow()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">{item.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Leave a Comment */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-4">Leave a Comment</h4>
            <form onSubmit={addComment} className="space-y-4">
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                type="text" 
                placeholder="Your Name" 
                required 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
              />
              <textarea 
                onChange={(e) => setContent(e.target.value)} 
                value={content} 
                placeholder="Share your thoughts..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 h-28" 
                required
              ></textarea>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                Submit Comment
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {/* Edit Modal */}
      <EditBlogModal
        blog={data}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={(updated) => setData(updated)}
      />
    </div>
  ) : <Loader />;
};

export default Blog;

