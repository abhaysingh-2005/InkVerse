import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const userGoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // 1. Google token verify
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload; 

        const isAdminEmail = email && process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
        const assignedRole = isAdminEmail ? 'Admin' : 'Writer';

        // 2. Check existing user
        let user = await User.findOne({ email });

        // 3. Save or update user
        if (!user) {
            user = new User({ 
                name, 
                email, 
                googleId: sub,
                picture,
                role: assignedRole
            });
            await user.save();
        } else if (isAdminEmail && user.role !== 'Admin') {
            user.role = 'Admin';
            await user.save();
        }

        // 4. Create JWT token containing id, email, role, and name
        const userToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({ 
            success: true, 
            token: userToken, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                picture: user.picture, 
                role: user.role 
            } 
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};