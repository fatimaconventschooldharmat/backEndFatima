import jwt from 'jsonwebtoken';

const authStudent = async (req, res, next) => {
    // token may come via Authorization header Bearer or cookie; prefer Bearer
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.json({ success: false, message: "Not authorized token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.studentId) {
            req.studentId = decoded.studentId;
            next();
        } else {
            return res.json({ success: false, message: "Not authorized" });
        }
    } catch (error) {
        return res.json({ success: false, message: "Not authorized" });
    }
};

export default authStudent;