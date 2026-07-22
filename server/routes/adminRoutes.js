import express from 'express'
import { adminLogin, googleLogin, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard } from "../controllers/adminController.js";
import { addBlog, generateContent } from "../controllers/blogController.js";
import auth from "../middleware/auth.js"
import multer from 'multer'

const adminRouter = express.Router();

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});
adminRouter.post("/login", adminLogin)
adminRouter.post("/google-login", googleLogin);
adminRouter.get("/comments", auth, getAllComments);
adminRouter.get("/blogs", auth, getAllBlogsAdmin);
adminRouter.post("/delete-comment", auth, deleteCommentById);
adminRouter.post("/approve-comment", auth, approveCommentById);
adminRouter.get("/dashboard", auth, getDashboard);
adminRouter.post("/generate-content", auth, generateContent);
export default adminRouter;
