import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
export const isLoggedIn = asyncHandler(async (req, _res, next) => {
    // Extract token from cookies
    console.log("Cookies:", req.cookies);
    const { token } = req.cookies;
    // If no token, send unauthorized message
    if (!token) {
        return next(new ErrorHandler(401, "Token not received - Unauthorized, please login to continue"));
    }
    // Decoding the token using jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If no decoded token, send unauthorized message
    if (!decoded || !decoded.id) {
        return next(new ErrorHandler(401, "Token not decoded - Unauthorized, please login to continue"));
    }
    // Fetch user details from the database using the user ID from the decoded token
    const user = await User.findById(decoded.id);
    // If no user found, send unauthorized message
    if (!user) {
        return next(new ErrorHandler(401, "User not found, please login again"));
    }
    // Attach the user object to the request object
    req.user = user;
    // Pass control to the next middleware or route handler
    next();
});
