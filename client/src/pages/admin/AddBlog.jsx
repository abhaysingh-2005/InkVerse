import React, { useState, useRef, useEffect } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { toast } from 'react-hot-toast' 
import { useAppContext } from '../../context/AppContext';
import { parse } from 'marked'

const AddBlog = () => {

  const { axios, token, refreshBlogs } = useAppContext()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const [image, setImage] = useState(false);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState('Startup');
  const [isPublished, setIsPublished] = useState(false);
  const [author, setAuthor] = useState(''); // 👈 State sahi hai

  const generateContent = async () => {
    if (!title) return toast.error('Please enter a title')
    try {
      setLoading(true);
      const { data } = await axios.post('/api/admin/generate-content', { prompt: title }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        quillRef.current.root.innerHTML = parse(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsAdding(true)

      const formData = new FormData();
      formData.append('title', title)
      formData.append('subTitle', subTitle)
      formData.append('description', quillRef.current.root.innerHTML)
      formData.append('category', category)
      formData.append('isPublished', isPublished)
      formData.append('image', image) 
      formData.append('author', author) // 👈 Sahi se append ho raha hai

      const { data } = await axios.post('/api/blog/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (data.success) {
        toast.success(data.message);
        setImage(false)
        setTitle('')
        setSubTitle('')
        if (quillRef.current) quillRef.current.root.innerHTML = ''
        setCategory('Startup')
        setIsPublished(false)
        setAuthor('') // 👈 Form clear hone par reset ho raha hai
        await refreshBlogs();
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll'>
      <div className='bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded'>
        
        {/* 1. Upload Thumbnail */}
        <p>Upload Thumbnail</p>
        <label htmlFor="image">
          <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" className='mt-2 h-16 rounded cursor-pointer'/>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
        </label>

        {/* 2. Blog Title */}
        <p className='mt-4'>Blog Title</p>
        <input type="text" placeholder='Type here' required className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' onChange={e => setTitle(e.target.value)} value={title} />

        {/* 3. Sub Title */}
        <p className='mt-4'>Sub Title</p>
        <input type="text" placeholder='Type here' required className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' onChange={e => setSubTitle(e.target.value)} value={subTitle} />
        
        {/* 4. Author Name (Sub Title ke theek neeche set kar diya hai) */}
        <p className='mt-4'>Author Name</p>
        <input 
          type="text" 
          placeholder='Enter author name...' 
          required 
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' 
          onChange={e => setAuthor(e.target.value)} 
          value={author} 
        />

        {/* 5. Blog Description */}
        <p className='mt-4'>Blog Description</p>
        <div className='max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative'>
          <div ref={editorRef}></div>
          {loading && ( 
            <div className='absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2'>
              <div className='w-8 h-8 rounded-full border-2 border-t-white animate-spin'></div>
            </div>
          )}
          <button disabled={loading} type='button' onClick={generateContent} className='absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer'>Generate with AI</button>
        </div>

        {/* 6. Blog Category (Extra duplicate dropdown hata diya hai) */}
        <p className='mt-4'>Blog category</p>
        <select value={category} onChange={e => setCategory(e.target.value)} name="category" className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded'>
          <option value="">Select category</option>
          {blogCategories.map((item, index) => {
            return <option key={index} value={item}>{item}</option>
          })}
        </select>

        {/* 7. Publish Now (Extra duplicate checkbox hata diya hai) */}
        <div className='flex gap-2 mt-4'>
          <p>Publish Now</p>
          <input type="checkbox" checked={isPublished} className='scale-125 cursor-pointer' onChange={e => setIsPublished(e.target.checked)}/>
        </div>

        {/* 8. Submit Button */}
        <button disabled={isAdding} type="submit" className='mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm'>{isAdding ? 'Adding...' : 'Add Blog'}</button>

      </div>
    </form>
  )
}

export default AddBlog;