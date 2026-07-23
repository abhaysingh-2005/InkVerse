import express from 'express';
import { userGoogleLogin, userRegister, userLogin, demoLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/google-login', userGoogleLogin);
userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.post('/demo-login', demoLogin);

export default userRouter;