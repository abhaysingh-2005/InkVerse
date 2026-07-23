import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb+srv://abhaysingh787569_db_user:m42AAVMJ8rVebKHk@blogcluster.qsndkn4.mongodb.net";
        const connString = mongoUri.endsWith('/quickblog') ? mongoUri : `${mongoUri}/quickblog`;
        await mongoose.connect(connString);
        console.log("Database Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
}

export default connectDB;