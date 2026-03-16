import jwt from 'jsonwebtoken';

export const authSeller = (req, res, next) => {
    const { sellerToken } = req.cookies;
    if (!sellerToken) {
        {
            return res.json({ success: false, message: "Unauthorized! Please login as seller" })
        }
    }
    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if (tokenDecode.email === process.env.SELLER_EMAIL) {
            next();
        }
        else {
            return res.json({ success: false, message: "not authorized seller" });
        }

    } catch (error) {
        return res.json({ success: false, message: "not authorized sell" });
    }
}