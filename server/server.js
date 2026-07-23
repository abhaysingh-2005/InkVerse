import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from "./configs/db.js";
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js'
import Blog from './models/Blog.js';

const app = express();

// Middlewares
app.use(cors())
app.use(express.json())

// Ensure DB connected middleware for Serverless & Express
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("DB Middleware error:", error.message);
        next();
    }
});

// Routes
app.get('/', (req, res) => res.send("API is Working"))
app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT)
    })
}

export default app;