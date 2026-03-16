import express, { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { isAuth } from "../controllers/UserController.js";


const authRouter = express.Router();
// step 1 : Redirect to user login with google



authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


authRouter.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set token as cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.redirect(`${process.env.CLIENT_URL}/`);
    } catch (error) {
        console.error("Error during Google OAuth callback:", error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
});

authRouter.get("/me", isAuth, (req, res) => {
    res.json({ success: true, user: req.user });
})

export default authRouter;