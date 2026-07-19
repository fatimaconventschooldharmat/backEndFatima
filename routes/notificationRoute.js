import express from 'express';
import { upload } from '../configs/multer.js';
import { getNotifications, markAsRead, createNotification, deleteNotification, uploadAttachment } from '../controllers/notificationController.js';
import authOptionalUser from '../middleware/authOptionalUser.js';
import authSellerOrUser from '../middleware/authSellerOrUser.js';

const notificationRouter = express.Router();

notificationRouter.get('/get', authOptionalUser, getNotifications);
notificationRouter.put('/read/:id', authOptionalUser, markAsRead);
// upload single file
notificationRouter.post('/upload', authSellerOrUser, upload.single('file'), uploadAttachment);
notificationRouter.post('/create', authSellerOrUser, createNotification);
notificationRouter.delete('/delete/:id', authSellerOrUser, deleteNotification);

export default notificationRouter;
