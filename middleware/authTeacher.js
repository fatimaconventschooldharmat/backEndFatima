import jwt from 'jsonwebtoken';

export const authTeacher = (req, res, next) => {
    const { teacherToken } = req.cookies;
    if (!teacherToken) {
        return res.json({ success: false, message: "Unauthorized! Please login as teacher" });
    }
    try {
        const tokenDecode = jwt.verify(teacherToken, process.env.JWT_SECRET);
        if (tokenDecode.email === process.env.TEACHER_EMAIL) {
            next();
        } else {
            return res.json({ success: false, message: "not authorized teacher" });
        }
    } catch (error) {
        return res.json({ success: false, message: "not authorized teacher" });
    }
};