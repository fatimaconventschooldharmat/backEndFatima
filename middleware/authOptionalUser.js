import jwt from 'jsonwebtoken';

const authOptionalUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.cookies && req.cookies.studentToken) {
            token = req.cookies.studentToken;
        }

        if (!token) {
            req.userId = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.studentId) {
                req.userId = decoded.studentId;
            } else {
                req.userId = null;
            }
        } catch (error) {
            req.userId = null;
        }

        return next();
    } catch (error) {
        req.userId = null;
        return next();
    }
};

export default authOptionalUser;
