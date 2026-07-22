import express from 'express';
import { 
    addBlog, 
    addComment, 
    deleteBlogById, 
    generateContent, 
    getAllBlogs, 
    getBlogById, 
    getBlogComments, 
    togglePublish,
    userAddBlog,    
    getUserBlogs,
    updateBlogById
} from "../controllers/blogController.js";
import upload from '../middleware/multer.js';
import auth from "../middleware/auth.js";

const blogRouter = express.Router();

// 1. Admin & Generate Routes
blogRouter.post("/add", upload.single('image'), auth, addBlog)
blogRouter.post('/delete', auth, deleteBlogById);
blogRouter.post('/update', upload.single('image'), auth, updateBlogById);
blogRouter.post('/toggle-publish', auth, togglePublish);
blogRouter.post('/generate', auth, generateContent);

// 2. User Dashboard Routes (Inhe dynamic routes se HAMESHA UPAR rakhna hai)
blogRouter.post('/user-add', upload.single('image'), auth, userAddBlog);
blogRouter.get('/user-blogs', auth, getUserBlogs); // 👈 Yeh upar aa gaya!

// 3. Public & Comment Routes
blogRouter.get('/all', getAllBlogs);
blogRouter.post('/add-comment', addComment);
blogRouter.post('/comments', getBlogComments);
blogRouter.get('/:blogId', getBlogById); // 👈 Dynamic route ab sabse NICHE hai!

export default blogRouter;