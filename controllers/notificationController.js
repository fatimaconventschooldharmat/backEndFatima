import Notification from "../models/Notification.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Get all notifications for the user : /api/notification/get
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        const notifications = await Notification.find({
            $or: [
                { recipientType: 'all' },
                { recipientIds: userId }
            ]
        }).sort({ createdAt: -1 });

        return res.json({ success: true, notifications });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Mark notification as read : /api/notification/read/:id
export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: { [`isRead.${userId}`]: true } },
            { new: true }
        );

        if (!notification) {
            return res.json({ success: false, message: "Notification not found" });
        }

        return res.json({ success: true, notification });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Create notification (Admin function) : /api/notification/create
export const createNotification = async (req, res) => {
    try {
        const { title, message, type, recipientType, recipientIds, priority, attachmentUrl } = req.body;

        if (!title || !message) {
            return res.json({ success: false, message: "Title and message are required" });
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'announcement',
            recipientType: recipientType || 'all',
            recipientIds: recipientIds || [],
            priority: priority || 'medium',
            attachmentUrl,
            createdBy: req.userId,
        });

        return res.json({ success: true, notification });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Upload attachment (image/file) to Cloudinary : /api/notification/upload
export const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'notifications',
            resource_type: 'auto'
        });

        // remove temp file
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

        return res.json({ success: true, url: result.secure_url });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Delete notification : /api/notification/delete/:id
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.json({ success: false, message: "Notification not found" });
        }

        return res.json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}
