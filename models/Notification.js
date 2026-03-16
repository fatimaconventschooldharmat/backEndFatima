import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['announcement', 'alert', 'event', 'holiday', 'exam', 'other'], default: 'announcement' },
    recipientType: { type: String, enum: ['all', 'students', 'teachers', 'parents'], default: 'all' },
    recipientIds: [{ type: mongoose.Schema.Types.ObjectId }],
    isRead: { type: Map, of: Boolean, default: {} },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    attachmentUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    createdAt: { type: Date, default: Date.now },
}, { minimize: false })

const Notification = mongoose.models.notification || mongoose.model('notification', notificationSchema);

export default Notification;
