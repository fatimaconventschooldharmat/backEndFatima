import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, },
    email: { type: String, required: true, unique: true },
    password: { type: String, },
    googleId: { type: String, },
    avatar: { type: String, },
    cartItems: { type: Object, default: {} },
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;