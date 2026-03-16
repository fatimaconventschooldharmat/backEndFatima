import express from 'express';
import { upload } from '../configs/multer.js';
import { getNotifications, markAsRead, createNotification, deleteNotification, uploadAttachment } from '../controllers/notificationController.js';
import authUser from '../middleware/authUser.js';

const notificationRouter = express.Router();

notificationRouter.get('/get', authUser, getNotifications);
notificationRouter.put('/read/:id', authUser, markAsRead);
// upload single file
notificationRouter.post('/upload', authUser, upload.single('file'), uploadAttachment);
notificationRouter.post('/create', authUser, createNotification);
notificationRouter.delete('/delete/:id', authUser, deleteNotification);

export default notificationRouter;
