// import jwt from "jsonwebtoken"

// const auth = (req, res, next)=>{
//     const token = req.headers.authorization;

//     try {
//         jwt.verify(token, process.env.JWT_SECRET)
//         next();
//     } catch (error) {
//         res.json({success: false, message: "Invalid token"})
//     }
// }

// export default auth;




import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({ success: false, message: "Token missing, please login again" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
        return res.json({ success: false, message: "Token missing, please login again" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "JAI HIND");
        req.user = decoded; 
        next();
    } catch (error) {
        res.json({ success: false, message: "Invalid or expired token, please login again" });
    }
};

export default auth;