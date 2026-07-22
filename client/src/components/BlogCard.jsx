import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog, onEdit, onDelete, onSaveToggle }) => {
  const { title, description, category, image, author, createdAt, _id } = blog;
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedBlogIds') || '[]');
    return saved.includes(_id);
  });

  const handleToggleSave = (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('savedBlogIds') || '[]');
    let updated;
    if (saved.includes(_id)) {
      updated = saved.filter((id) => id !== _id);
      setIsSaved(false);
    } else {
      updated = [...saved, _id];
      setIsSaved(true);
    }
    localStorage.setItem('savedBlogIds', JSON.stringify(updated));
    if (onSaveToggle) onSaveToggle(_id, !isSaved);
  };

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) : 'Recent';

  // Calculate estimated read time based on description length
  const readTime = Math.max(1, Math.ceil((description ? description.length : 100) / 400));

  return (
    <div 
      onClick={() => navigate(`/blog/${_id}`)} 
      className="group relative bg-slate-900/80 dark:bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md"
    >
      <div>
        {/* Card Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
          <img 
            src={image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

          {/* Category Pill */}
          <span className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-full text-indigo-300 text-[11px] font-bold tracking-wide shadow-md">
            {category || 'Article'}
          </span>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleToggleSave}
            title={isSaved ? "Remove from Saved" : "Save Article"}
            className={`absolute top-3 right-3 p-1.5 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isSaved
                ? 'bg-indigo-600 border-indigo-400 text-white scale-105'
                : 'bg-slate-950/70 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            {isSaved ? '🔖' : '📑'}
          </button>

          {/* Read Time Tag */}
          <span className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-300 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-0.5 rounded-md">
            ⏱️ {readTime} min read
          </span>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="mb-2 text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug tracking-tight">
            {title}
          </h3>

          <div 
            className="text-xs text-slate-400 line-clamp-2 leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: description ? description.replace(/<[^>]*>?/gm, '').slice(0, 90) + '...' : '' }}
          ></div>
        </div>
      </div>

      {/* Footer Meta & Scoped Controls */}
      <div className="px-5 pb-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-[10px] font-extrabold text-indigo-300 uppercase">
              {(author || 'A')[0]}
            </div>
          </div>
          <span className="truncate font-semibold text-slate-300 text-[11px]">{author || 'Author'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 text-[11px] whitespace-nowrap">{formattedDate}</span>
        </div>

        {/* Action Controls: Rendered ONLY if authorized (Owner or Admin) */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 p-1 rounded-xl shadow-inner flex-shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(blog);
                }}
                title="Edit My Post"
                className="p-1.5 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(blog._id);
                }}
                title="Delete Post"
                className="p-1.5 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;


