import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res, next) => {
    // const { userName, email, fullName, password } = req.body;
    // if (!userName || !email || !fullName || !password) {
    //     return next(new ApiError(400, "All fields are required"));
    // }
    // const user = await User.create({ userName, email, fullName, password });
    // res.status(200).json(new ApiResponse(200, user, "User registered successfully"));
    res.status(200).json({
        message: "okay",
    })
});

export {
    registerUser,
}

// export const loginUser = asyncHandler(async (req, res, next) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return next(new ApiError(400, "All fields are required"));
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//         return next(new ApiError(400, "User not found"));
//     }
//     const isPasswordCorrect = await user.isPasswordCorrect(password);
//     if (!isPasswordCorrect) {
//         return next(new ApiError(400, "Invalid password"));
//     }
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();
//     res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, "User logged in successfully"));
// });