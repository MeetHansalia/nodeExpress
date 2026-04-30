import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryService.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to generate access token and refresh token");
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    //get user details from request body
    // validate request body
    // check if user already exists:username and email
    //check for images and avatar
    //upload images to cloudinary
    //create user in database
    //remove password and refreshToken from response
    //check if user is created successfully
    //return response

    //1
    const { userName, email, fullName, password } = req.body;
    console.log("user details", userName, email, fullName, password);
    if ([userName, email, fullName, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required and cannot be empty");
    }

    //2
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    //3
    const avatar = req.files?.avatar[0]?.path;
    const coverImage = req.files?.coverImage[0]?.path;
    console.log("avatar", avatar);
    console.log("coverImage", coverImage);
    if (!avatar || !coverImage) {
        throw new ApiError(400, "All images are required");
    }
    //4
    const uploadedAvatar = await uploadImageToCloudinary(avatar);
    const uploadedCoverImage = await uploadImageToCloudinary(coverImage);
    if (!uploadedAvatar?.url || !uploadedCoverImage?.url) {
        throw new ApiError(500, "Failed to upload images");
    }

    let user;
    try {
        user = await User.create({
            userName: userName.toLowerCase(),
            email: email.toLowerCase(),
            fullName: fullName.toLowerCase().trim(),
            avatar: uploadedAvatar.url,
            coverImage: uploadedCoverImage.url,
            password: password.trim(),
        });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(409, "Username or email already exists");
        }
        throw new ApiError(500, error?.message || "Failed to create user");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    //get user details from request body
    // validate request body
    // check if user exists:username or email
    // find user
    //check for password   
    //generate access token and refresh token
    //send cookies
    //return response

    const { userName, email, password } = req.body;
    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ userName }, { email }] });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});


export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", "", options)
        .clearCookie("refreshToken", "", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized");
        }
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid user id");
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is invalid");
        }
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, "Unauthorized");
    }
}
)

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // if (newPassword !== confirmNewPassword) {
    //     throw new ApiError(400, "New password and confirm new password do not match");
    // }
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));

})

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
})

export const updateCurrentUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email } = req.body;

    if (!fullName || !userName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, email: email.toLowerCase(), userName: userName.toLowerCase() } },
        { new: true }
    ).select("-password -refreshToken");


    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));

})


export const updateCurrentUserAvatar = asyncHandler(async (req, res) => {
    const avatar = req.files?.avatar[0]?.path;
    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }
    const uploadedAvatar = await uploadImageToCloudinary(avatar);
    if (!uploadedAvatar?.url) {
        throw new ApiError(500, "Failed to upload avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: uploadedAvatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})

export const updateCurrentUserCoverImage = asyncHandler(async (req, res) => {
    const coverImage = req.file?.coverImage[0]?.path;
    if (!coverImage) {
        throw new ApiError(400, "Cover image is required");
    }
    const uploadedNewCoverImage = await uploadImageToCloudinary(coverImage);
    if (!uploadedNewCoverImage?.url) {
        throw new ApiError(500, "Failed to upload cover image");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: uploadedNewCoverImage.url } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
})

export const deleteCurrentUser = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id);
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", "", options).clearCookie("refreshToken", "", options).json(new ApiResponse(200, {}, "User deleted successfully"));
})
