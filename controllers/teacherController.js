import jwt from 'jsonwebtoken';

// login teacher
export const teacherLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (password === process.env.TEACHER_PASSWORD && email === process.env.TEACHER_EMAIL) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.cookie('teacherToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({ success: true, message: "Teacher logged in successfully" });
        } else {
            res.json({ success: false, message: "Invalid teacher credentials" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const isTeacherAuth = async (req, res) => {
    try {
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const teacherLogout = async (req, res) => {
    try {
        res.clearCookie('teacherToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        res.json({ success: true, message: "Teacher logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};