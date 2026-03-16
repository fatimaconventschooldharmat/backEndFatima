
import express from 'express';
import { isAuth, logout, subscribeWhatsApp } from '../controllers/UserController.js';
import authUser from '../middleware/authUser.js';
const userRouter = express.Router();

userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', logout);
userRouter.post('/whatsapp', authUser, subscribeWhatsApp);

export default userRouter;