import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "not authorized token" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            next();
        } else {
            return res.json({ success: false, message: "not authorized here" });
        }
    } catch (error) {

        return res.json({ success: false, message: "not authorized there" });
    }
}

export default authUser;