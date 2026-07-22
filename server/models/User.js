import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    picture: {
        type: String
    },
    role: {
        type: String,
        enum: ['Admin', 'Writer'],
        default: 'Writer' // Naye log login karte hi pehle Writer banenge
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;