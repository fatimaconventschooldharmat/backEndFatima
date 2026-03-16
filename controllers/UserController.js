import User from "../models/User.js";
import jwt from "jsonwebtoken";
import WhatsAppNumber from "../models/WhatsAppNumber.js";

// check Auth User : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const userId = req.userId; // from auth middleware
        if (!userId) {
            return res.json({ success: false, message: "User ID not found" });
        }
        const user = await User.findById(userId).select('-password');   // Exclude password field
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, user });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}


// Logout User : /api/user/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: '/'
        });

        return res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}


// Subscribe WhatsApp Number : /api/user/whatsapp
export const subscribeWhatsApp = async (req, res) => {
    try {
        const userId = req.userId;
        const { whatsappnumber } = req.body;

        if (!whatsappnumber) {
            return res.json({ success: false, message: "WhatsApp number is required" });
        }

        // check if this user has already added a number
        const existingForUser = await WhatsAppNumber.findOne({ userId });
        if (existingForUser) {
            return res.json({ success: false, message: "You can only subscribe one WhatsApp number" });
        }

        // optional: still enforce that the same number cannot be reused by another user
        const existingNumber = await WhatsAppNumber.findOne({ whatsappnumber });
        if (existingNumber) {
            return res.json({ success: false, message: "WhatsApp Number already exists" });
        }

        const num = await WhatsAppNumber.create({
            userId,
            whatsappnumber
        });

        return res.json({ success: true, message: "Subscribed to WhatsApp notifications successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}