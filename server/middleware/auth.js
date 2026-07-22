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




import jwt from "jsonwebtoken"

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.json({ success: false, message: "Token missing, please login again" })
    }

    try {
        // Token decode karke decoded payload data nikalenge
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Decoded data ko req.user mein daal rahe hain taaki controller use kar sake
        req.user = decoded; 
        
        next();
    } catch (error) {
        res.json({ success: false, message: "Invalid token, please login again" })
    }
}

export default auth;