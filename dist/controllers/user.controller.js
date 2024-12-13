import asynhandler from "express-async-handler";
import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/user.model.js';
const cookieOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
};
/**
 * @REGISTER
 * @ROUTE @POST {{URL}}/api/v1/user/register
 * @ACCESS Public
 */
export const registerUser = asynhandler(async (req, res, next) => {
    // Destructuring the necessary data from req object
    const { fullName, email, password, phoneNumber } = req.body;
    // Check if the data is there or not, if not throw error message
    if (!fullName || !email || !password || !phoneNumber) {
        return next(new ErrorHandler(400, 'All fields are required'));
    }
    // Check if the user exists with the provided email
    const userExists = await User.findOne({ email });
    // If user exists send the reponse
    if (userExists) {
        return next(new ErrorHandler(409, 'Email already exists'));
    }
    // Create new user with the given necessary data and save to DB
    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
    });
    // If user not created send message response
    if (!user) {
        return next(new ErrorHandler(400, 'User registration failed, please try again later'));
    }
    // Save the user object
    await user.save();
    // Generating a JWT token
    const token = await user.generateJWTToken();
    // Setting the password to undefined so it does not get sent in the response
    user.password = "0";
    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie('token', token, cookieOptions);
    // If all good send the response to the frontend
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });
});
/**
 * @LOGIN
 * @ROUTE @POST {{URL}}/api/v1/user/login
 * @ACCESS Public
 */
export const loginUser = asynhandler(async (req, res, next) => {
    // Destructuring the necessary data from req object
    const { email, password } = req.body;
    // Check if the data is there or not, if not throw error message
    if (!email || !password) {
        return next(new ErrorHandler(400, 'Email and Password are required'));
    }
    // Finding the user with the sent email
    const user = await User.findOne({ email }).select('+password');
    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
        return next(new ErrorHandler(401, 'Email or Password do not match or user does not exist'));
    }
    // Generating a JWT token
    const token = await user.generateJWTToken();
    // Setting the password to undefined so it does not get sent in the response
    user.password = "0";
    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie('token', token, cookieOptions);
    // If all good send the response to the frontend
    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user,
        token,
    });
});
/**
 * @LOGOUT
 * @ROUTE @POST {{URL}}/api/v1/user/logout
 * @ACCESS Public
 */
export const logoutUser = asynhandler(async (req, res, next) => {
    // Setting the cookie value to null
    res.cookie('token', null, {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
        httpOnly: true,
    });
    // Sending the response
    res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
});
/**
 * @LOGGED_IN_USER_DETAILS
 * @ROUTE @GET {{URL}}/api/v1/user/me
 * @ACCESS Private(Logged in users only)
 */
export const getLoggedInUserDetails = asynhandler(async (req, res, next) => {
    // Finding the user using the id from modified req object
    const user = await User.findById(req?.user?.id);
    res.status(200).json({
        success: true,
        message: 'User details',
        user: { id: user?._id, fullName: user?.fullName, email: user?.email, phoneNumber: user?.phoneNumber },
    });
});
/**
 * @UPDATE_USER
 * @ROUTE @POST {{URL}}/api/v1/user/update/:id
 * @ACCESS Private (Logged in user only)
 */
export const updateUser = asynhandler(async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { fullName, email, phoneNumber } = req.body;
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id);
    if (!user) {
        return next(new ErrorHandler(400, 'Invalid user id or user does not exist'));
    }
    if (fullName) {
        user.fullName = fullName;
    }
    if (email) {
        user.email = email;
    }
    if (phoneNumber) {
        user.phoneNumber = phoneNumber;
    }
    // Save the user object
    await user.save();
    res.status(200).json({
        success: true,
        message: 'User details updated successfully',
    });
});
