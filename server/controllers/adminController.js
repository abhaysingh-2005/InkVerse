import jwt from 'jsonwebtoken'
import Blog  from '../models/Blog.js'
import Comment from '../models/Comment.js'
import { OAuth2Client } from 'google-auth-library'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "abhaysingh787569@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Rajawat@123";
const JWT_SECRET = process.env.JWT_SECRET || "JAI HIND";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "363221562943-smiddvk5eqifmpj4b9gemki95k1a74i3.apps.googleusercontent.com";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);


// function to allow user login to applicationn
export const adminLogin = async (req, res)=>{
    try{
        const {email, password} = req.body;

        if(email!== ADMIN_EMAIL || password !== ADMIN_PASSWORD){
            return res.json({success: false, message: "Invalid Credentials"})
        }

        const token = jwt.sign({email}, JWT_SECRET)
        res.json({success: true, token})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}




// Google Login Function
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // Google se token verify karein
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email } = payload;

        // Admin email check karein (.env se)
        if (email !== ADMIN_EMAIL) {
            return res.json({ success: false, message: "Unauthorized Admin Access!" });
        }

        // JWT token banayein
        const adminToken = jwt.sign({ email }, JWT_SECRET);
        res.json({ success: true, token: adminToken });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}




export const getAllBlogsAdmin = async (req, res)=>{
    try {
        const blogs = await Blog.find({}).sort({createdAt: -1});
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllComments = async (req, res)=>{
    try {
        const comments = await Comment.find({}).populate("blog").sort({createdAt: -1})
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export const getDashboard = async (req, res)=>{
    try {
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments()
        const drafts = await Blog.countDocuments({isPublished: false})

        const dashboardData = {
            blogs, comments, drafts, recentBlogs
        }
        res.json({success: true, dashboardData})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export const deleteCommentById = async(req, res)=>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({success: true, message: "Comment Deleted Successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const approveCommentById = async(req, res)=>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndUpdate(id, {isApproved: true});
        res.json({success: true, message: "Comment approved Successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

