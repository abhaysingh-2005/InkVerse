import express from 'express';
import { userGoogleLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/google-login', userGoogleLogin);

export default userRouter;