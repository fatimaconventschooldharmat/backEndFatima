import User from "../models/User.js";


// update user cart data : /api/cart/update



export const updateCart = async (req, res) => {
    try {
        // prefer userId from auth middleware, fallback to body
        const userId = req.userId || req.body.userId || (req.body.user && req.body.user._id);
        const { cartItems } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        if (!cartItems || typeof cartItems !== 'object') {
            return res.json({ success: false, message: "No cartItems provided" });
        }

        await User.findByIdAndUpdate(userId, { cartItems });
        res.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}