import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinaryService.js";

export const registerUser = asyncHandler(async (req, res, next) => {
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
    User.findOne({ $or: [{ userName }, { email }] }).then((user) => {
        if (user) {
            throw new ApiError(409, "User already exists");
        }
    }).catch((error) => {
        throw new ApiError(500, "Internal server error");
    });

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

    const user = await User.create({
        userName: userName.toLowerCase(),
        email: email.toLowerCase(),
        fullName: fullName.toLowerCase().trim(),
        avatar: uploadedAvatar.url,
        coverImage: uploadedCoverImage.url,
        password: password.trim(),
    }).then((user) => {
        res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
    }).catch((error) => {
        throw new ApiError(500, "Failed to create user", error);
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {

        throw new ApiError(500, "Failed to create user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});