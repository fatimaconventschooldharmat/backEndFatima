import pkg from 'passport-google-oauth20';
import passport from 'passport';
import User from '../models/User.js';

const { Strategy: GoogleStrategy } = pkg;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},

    async (accessToken, refreshToken, profile, cb) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    avatar: profile.photos?.[0]?.value,
                });
                await user.save();
            }
            return cb(null, user);
        } catch (error) {
            return cb(error, null);
        }
    }
));