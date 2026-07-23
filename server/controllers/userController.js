import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "363221562943-smiddvk5eqifmpj4b9gemki95k1a74i3.apps.googleusercontent.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "abhaysingh787569@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET || "JAI HIND";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 1. Google Login Handler
export const userGoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.json({ success: false, message: "Google Token is missing" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload; 

        const isAdminEmail = email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const assignedRole = isAdminEmail ? 'Admin' : 'Writer';

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ 
                name, 
                email, 
                googleId: sub,
                picture,
                role: assignedRole
            });
            await user.save();
        } else {
            if (isAdminEmail && user.role !== 'Admin') {
                user.role = 'Admin';
            }
            if (!user.googleId) {
                user.googleId = sub;
            }
            if (picture && !user.picture) {
                user.picture = picture;
            }
            await user.save();
        }

        const userToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role }, 
            JWT_SECRET, 
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
        res.json({ success: false, message: error.message || "Google Authentication Failed" });
    }
};

// 2. Email & Password Registration
export const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill in all fields (Name, Email, Password)" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "An account with this email already exists" });
        }

        const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const role = isAdminEmail ? 'Admin' : 'Writer';

        const picture = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

        const newUser = new User({
            name,
            email,
            password, // stored plain/hashed
            picture,
            role
        });

        await newUser.save();

        const userToken = jwt.sign(
            { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: "Account registered successfully!",
            token: userToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                picture: newUser.picture,
                role: newUser.role
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Email & Password Login
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Please enter both Email and Password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Account not found. Please sign up first." });
        }

        if (user.password && user.password !== password) {
            return res.json({ success: false, message: "Incorrect password" });
        }

        const userToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: "Signed in successfully!",
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

// 4. One-Click Demo Login (Writer or Admin) with Valid JWT
export const demoLogin = async (req, res) => {
    try {
        const { role } = req.body;
        const isDemoAdmin = role === 'Admin';
        const demoEmail = isDemoAdmin ? ADMIN_EMAIL : 'writer@inkverse.com';
        const demoName = isDemoAdmin ? 'Demo Admin' : 'Demo Writer';
        const demoPicture = isDemoAdmin 
            ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' 
            : 'https://api.dicebear.com/7.x/adventurer/svg?seed=writer';

        let user = await User.findOne({ email: demoEmail });
        if (!user) {
            user = new User({
                name: demoName,
                email: demoEmail,
                picture: demoPicture,
                role: isDemoAdmin ? 'Admin' : 'Writer'
            });
            await user.save();
        }

        const userToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: `Logged in as ${user.name}!`,
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