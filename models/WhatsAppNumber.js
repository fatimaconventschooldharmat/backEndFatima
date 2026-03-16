import mongoose from "mongoose";

const numberSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user', unique: true }, // ensure one entry per user
    whatsappnumber: { type: Number, required: true, unique: true }, // also prevent duplicate numbers globally
}, { minimize: false });

// create compound index if you prefer to enforce per-user uniqueness separately
// numberSchema.index({ userId: 1 }, { unique: true });

const WhatsAppNumber = mongoose.models.whatsappnumber || mongoose.model('whatsappnumber', numberSchema);

export default WhatsAppNumber;
