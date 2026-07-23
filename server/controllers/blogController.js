import fs from 'fs'
import imageKit from '../configs/imagekit.js'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import { generateAIContent } from '../configs/gemini.js';

// Helper function to generate blog description
const generateBlogDescription = async (promptText) => {
    try {
        const content = await generateAIContent(promptText);
        return content;
    } catch (error) {
        console.error("Gemini Error:", error.message);
        return "Default AI description due to server error.";
    }
};

export const addBlog = async (req, res)=>{
    try{
        const {title, subTitle, description, category, isPublished, author} = req.body;
        const imageFile = req.file;

        if(!title || !description || !category || !imageFile){
            return res.json({success: false, message: "Missing required fields"})
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder:"/blogs"
        })

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '1280'}
            ]
        });

        const image = optimizedImageUrl;
        const truePublish = isPublished ==='true' || isPublished ===true
        await Blog.create({
            title,
            subTitle, 
            description, 
            category, 
            image, 
            isPublished: truePublish,
            author: author || "Anonymous"
        })

        res.json({success: true, message: "Blog added successfully"})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById = async (req, res)=>{
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.json({success: false, message: "Blog not found"})
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        const userRole = req.user?.role;
        const userEmail = req.user?.email;
        const userName = req.user?.name || req.body?.userName;

        const isAdmin = userRole === 'Admin' || (userEmail && process.env.ADMIN_EMAIL && userEmail.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
        const isAuthor = !!(blog.author && blog.author !== 'Anonymous' && userName && blog.author.trim().toLowerCase() === userName.trim().toLowerCase());

        if (!isAdmin && !isAuthor) {
            return res.json({ success: false, message: "Unauthorized: You can only delete your own personal blog posts." });
        }

        await Blog.findByIdAndDelete(id);
        await Comment.deleteMany({ blog: id });
        res.json({ success: true, message: 'Blog Deleted Successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const togglePublish = async(req, res)=>{
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: 'Blog Status Updated'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const addComment = async (req, res)=>{
    try {
        const {blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogComments = async (req, res)=>{
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort({createdAt: -1});
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// 🎯 MAIN ROUTE HANDLER FOR AI CONTENT GENERATION
export const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.json({ success: false, message: "Please provide a title or prompt." });
        }
        
        const fullPrompt = `${prompt}\n\nPlease write a detailed, engaging, and well-structured blog post based on the topic above. Use HTML/Markdown formatting with bold headers, bullet points, and clean paragraphs.`;
        const content = await generateAIContent(fullPrompt);

        return res.json({ success: true, content });
    } catch (error) {
        console.error("Generate Content Error:", error.message);
        return res.json({ 
            success: false, 
            message: error.message || "Failed to generate AI content." 
        });
    }
}

export const userAddBlog = async (req, res) => {
    try {
        const { title, subTitle, description, category, isPublished, author } = req.body;
        const imageFile = req.file;

        if (!title || !description || !category || !imageFile) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '1280' }
            ]
        });

        const image = optimizedImageUrl;
        const truePublish = isPublished === 'true' || isPublished === true;

        await Blog.create({ 
            title, 
            subTitle, 
            description, 
            category, 
            image, 
            isPublished: truePublish,
            author: author || "Anonymous"
        })

        res.json({ success: true, message: "Blog added successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getUserBlogs = async (req, res) => {
    try {
        const userName = req.user?.name || req.query?.userName || req.body?.userName;
        const userRole = req.user?.role || req.query?.userRole;

        let query = {};
        if (userRole === 'Admin' || (userName && userName.toLowerCase().includes('admin'))) {
            query = { 
                $or: [
                    { author: { $regex: /^admin$/i } }, 
                    { author: "Admin" }, 
                    { author: "Anonymous" },
                    { author: { $regex: new RegExp(`^${(userName || 'Admin').trim()}$`, 'i') } }
                ] 
            };
        } else if (userName) {
            query = { author: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } };
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateBlogById = async (req, res) => {
    try {
        const { id, title, subTitle, description, category, isPublished, author } = req.body;
        const imageFile = req.file;

        if (!id) {
            return res.json({ success: false, message: "Blog ID is required" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        const userRole = req.user?.role;
        const userEmail = req.user?.email;
        const userName = req.user?.name || req.body?.userName;

        const isAdmin = userRole === 'Admin' || (userEmail && process.env.ADMIN_EMAIL && userEmail.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
        const isAuthor = !!(blog.author && blog.author !== 'Anonymous' && userName && blog.author.trim().toLowerCase() === userName.trim().toLowerCase());

        if (!isAdmin && !isAuthor) {
            return res.json({ success: false, message: "Unauthorized: You can only edit your own personal blog posts." });
        }

        if (title !== undefined) blog.title = title;
        if (subTitle !== undefined) blog.subTitle = subTitle;
        if (description !== undefined) blog.description = description;
        if (category !== undefined) blog.category = category;
        if (author !== undefined) blog.author = author;
        if (isPublished !== undefined) {
            blog.isPublished = isPublished === 'true' || isPublished === true;
        }

        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            });
            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });
            blog.image = optimizedImageUrl;
        }

        await blog.save();
        res.json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

